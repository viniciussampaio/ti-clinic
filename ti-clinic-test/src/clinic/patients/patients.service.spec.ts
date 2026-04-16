import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, type EntityManager, type Repository } from 'typeorm';
import { HealthPlan } from '../entities/health-plan.entity';
import { Patient } from '../entities/patient.entity';
import { PatientPlan } from '../entities/patient-plan.entity';
import { PatientsService } from './patients.service';

type RepoMock<T> = Pick<Repository<T>, 'find' | 'findOne' | 'remove'>;

function createRepoMock<T extends object>(): jest.Mocked<RepoMock<T>> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
}

function queryFailed(options: { errno: number; sqlMessage?: string; message?: string }): QueryFailedError {
  return new QueryFailedError('q', [], options as any);
}

function createManagerMock() {
  const manager: Partial<EntityManager> & {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    merge: jest.Mock;
  } = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
  };
  return manager;
}

describe('PatientsService', () => {
  let service: PatientsService;
  let dataSource: { transaction: jest.Mock };
  let repo: jest.Mocked<RepoMock<Patient>>;

  beforeEach(async () => {
    repo = createRepoMock<Patient>();
    dataSource = { transaction: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(Patient), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(PatientsService);
  });

  it('create: creates patient without plan (returns from findOne)', async () => {
    const manager = createManagerMock();
    manager.create.mockReturnValueOnce({} as any);
    manager.save.mockResolvedValueOnce({ id: 10 } as any);
    dataSource.transaction.mockImplementation(async (fn: any) => fn(manager));

    repo.findOne.mockResolvedValueOnce({ id: 10, patientPlans: [] } as any);

    await expect(
      service.create({ name: 'A', cpf: '123', birthDate: '2000-01-01' } as any),
    ).resolves.toMatchObject({ id: 10, currentHealthPlan: null });
  });

  it('create: throws 422 when CPF is duplicated (duplicate entry containing \"cpf\")', async () => {
    const manager = createManagerMock();
    manager.create.mockReturnValueOnce({} as any);
    manager.save.mockRejectedValueOnce(queryFailed({ errno: 1062, sqlMessage: 'Duplicate entry ... cpf' }));
    dataSource.transaction.mockImplementation(async (fn: any) => fn(manager));

    await expect(
      service.create({ name: 'A', cpf: '123', birthDate: '2000-01-01' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('create: with plan throws NotFound when healthPlan does not exist', async () => {
    const manager = createManagerMock();
    manager.create.mockReturnValueOnce({} as any);
    manager.save.mockResolvedValueOnce({ id: 10 } as any);
    manager.findOne.mockResolvedValueOnce(null);
    dataSource.transaction.mockImplementation(async (fn: any) => fn(manager));

    await expect(
      service.create({
        name: 'A',
        cpf: '123',
        birthDate: '2000-01-01',
        healthPlanEnrollment: { healthPlanId: 1 },
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove: throws 409 when patient has linked consultations (errno 1451)', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 1 } as any);
    repo.remove.mockRejectedValueOnce(queryFailed({ errno: 1451 }) as any);

    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });
});

