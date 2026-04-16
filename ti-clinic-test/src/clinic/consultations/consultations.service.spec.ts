import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Consultation } from '../entities/consultation.entity';
import { Doctor } from '../entities/doctor.entity';
import { PatientPlan } from '../entities/patient-plan.entity';
import { Patient } from '../entities/patient.entity';
import { Procedure } from '../entities/procedure.entity';
import { ConsultationsService } from './consultations.service';

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

describe('ConsultationsService', () => {
  let service: ConsultationsService;
  let repo: jest.Mocked<RepoMock<Consultation>>;
  let patientRepo: jest.Mocked<RepoMock<Patient>>;
  let doctorRepo: jest.Mocked<RepoMock<Doctor>>;
  let patientPlanRepo: jest.Mocked<RepoMock<PatientPlan>>;
  let procedureRepo: jest.Mocked<RepoMock<Procedure>>;

  beforeEach(async () => {
    repo = createRepoMock<Consultation>();
    patientRepo = createRepoMock<Patient>();
    doctorRepo = createRepoMock<Doctor>();
    patientPlanRepo = createRepoMock<PatientPlan>();
    procedureRepo = createRepoMock<Procedure>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ConsultationsService,
        { provide: getRepositoryToken(Consultation), useValue: repo },
        { provide: getRepositoryToken(Patient), useValue: patientRepo },
        { provide: getRepositoryToken(Doctor), useValue: doctorRepo },
        { provide: getRepositoryToken(PatientPlan), useValue: patientPlanRepo },
        { provide: getRepositoryToken(Procedure), useValue: procedureRepo },
      ],
    }).compile();

    service = moduleRef.get(ConsultationsService);
  });

  it('create: private pay allows procedure without doctor and without plan', async () => {
    patientRepo.findOne.mockResolvedValueOnce({ id: 1 } as any);
    procedureRepo.find.mockResolvedValueOnce([{ id: 10 }, { id: 11 }] as any);
    repo.create.mockImplementation((v: any) => v);
    repo.save.mockResolvedValueOnce({ id: 100 } as any);
    repo.findOne.mockResolvedValueOnce({
      id: 100,
      patient: { id: 1 },
      doctor: null,
      patientPlan: null,
      procedures: [{ id: 10 }, { id: 11 }],
    } as any);

    await expect(
      service.create({
        appointmentDate: '2026-04-14',
        appointmentTime: '10:15',
        isPrivatePay: true,
        patientId: 1,
        procedureIds: [10, 11],
      } as any),
    ).resolves.toMatchObject({
      id: 100,
      doctor: null,
      patientPlan: null,
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentTime: '10:15:00',
        isPrivatePay: true,
      }),
    );
  });

  it('create: requires doctorId and specialtyId together', async () => {
    patientRepo.findOne.mockResolvedValueOnce({ id: 1 } as any);
    await expect(
      service.create({
        appointmentDate: '2026-04-14',
        appointmentTime: '10:15',
        patientId: 1,
        doctorId: 1,
        isPrivatePay: true,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create: non-private pay requires patientPlanId', async () => {
    patientRepo.findOne.mockResolvedValueOnce({ id: 1 } as any);
    await expect(
      service.create({
        appointmentDate: '2026-04-14',
        appointmentTime: '10:15',
        patientId: 1,
        isPrivatePay: false,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update: allows editing appointmentDate', async () => {
    repo.findOne.mockResolvedValueOnce({
      id: 1,
      appointmentDate: '2026-04-14',
      appointmentTime: '10:15:00',
      isPrivatePay: true,
      patient: { id: 1 },
      doctor: null,
      patientPlan: null,
      procedures: [],
    } as any);
    patientRepo.findOne.mockResolvedValueOnce({ id: 1 } as any);
    repo.save.mockResolvedValueOnce({} as any);
    repo.findOne.mockResolvedValueOnce({
      id: 1,
      appointmentDate: '2026-05-01',
      appointmentTime: '10:15:00',
    } as any);

    await expect(service.update(1, { appointmentDate: '2026-05-01' } as any)).resolves.toMatchObject(
      { appointmentDate: '2026-05-01' },
    );
  });

  it('attachProcedure: throws BadRequest when procedure is already linked', async () => {
    repo.findOne.mockResolvedValueOnce({
      id: 1,
      procedures: [{ id: 10 }],
    } as any);
    procedureRepo.findOne.mockResolvedValueOnce({ id: 10 } as any);

    await expect(service.attachProcedure(1, 10)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('detachProcedure: throws NotFound when procedure is not linked', async () => {
    repo.findOne.mockResolvedValueOnce({
      id: 1,
      procedures: [{ id: 10 }],
    } as any);

    await expect(service.detachProcedure(1, 11)).rejects.toBeInstanceOf(NotFoundException);
  });
});

