import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, type Repository } from 'typeorm';
import { HealthPlan } from '../entities/health-plan.entity';
import { PatientPlan } from '../entities/patient-plan.entity';
import { Patient } from '../entities/patient.entity';
import { PatientPlansService } from './patient-plans.service';

type RepoMock<T> = Pick<Repository<T>, 'create' | 'save' | 'find' | 'findOne' | 'remove'>;

function createRepoMock<T extends object>(): jest.Mocked<RepoMock<T>> {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
}

function duplicateKeyError(): QueryFailedError {
  return new QueryFailedError('q', [], { errno: 1062 } as any);
}

describe('PatientPlansService', () => {
  let service: PatientPlansService;
  let repo: jest.Mocked<RepoMock<PatientPlan>>;
  let patientRepo: jest.Mocked<RepoMock<Patient>>;
  let healthPlanRepo: jest.Mocked<RepoMock<HealthPlan>>;

  beforeEach(async () => {
    repo = createRepoMock<PatientPlan>();
    patientRepo = createRepoMock<Patient>();
    healthPlanRepo = createRepoMock<HealthPlan>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PatientPlansService,
        { provide: getRepositoryToken(PatientPlan), useValue: repo },
        { provide: getRepositoryToken(Patient), useValue: patientRepo },
        { provide: getRepositoryToken(HealthPlan), useValue: healthPlanRepo },
      ],
    }).compile();

    service = moduleRef.get(PatientPlansService);
  });

  it('create: throws NotFound when patient does not exist', async () => {
    patientRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.create({ patientId: 1, healthPlanId: 1, contractNumber: 'X' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create: throws Conflict when duplicate key', async () => {
    patientRepo.findOne.mockResolvedValueOnce({ id: 1 } as any);
    healthPlanRepo.findOne.mockResolvedValueOnce({ id: 1 } as any);
    repo.create.mockReturnValueOnce({} as any);
    repo.save.mockRejectedValueOnce(duplicateKeyError());

    await expect(
      service.create({ patientId: 1, healthPlanId: 1, contractNumber: 'X' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findOne: throws NotFound when enrollment does not exist', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: sets contractNumber to null when explicitly provided as null', async () => {
    const row = { id: 1, contractNumber: 'A' } as any;
    repo.findOne.mockResolvedValueOnce(row);
    repo.save.mockResolvedValueOnce({ ...row, contractNumber: null } as any);

    await expect(service.update(1, { contractNumber: null } as any)).resolves.toMatchObject({
      contractNumber: null,
    });
  });
});

