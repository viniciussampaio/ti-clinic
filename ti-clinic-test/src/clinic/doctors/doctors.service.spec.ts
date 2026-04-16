import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Specialty } from '../entities/specialty.entity';
import { Doctor } from '../entities/doctor.entity';
import { DoctorsService } from './doctors.service';

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

describe('DoctorsService', () => {
  let service: DoctorsService;
  let doctorRepo: jest.Mocked<RepoMock<Doctor>>;
  let specialtyRepo: jest.Mocked<RepoMock<Specialty>>;

  beforeEach(async () => {
    doctorRepo = createRepoMock<Doctor>();
    specialtyRepo = createRepoMock<Specialty>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        DoctorsService,
        { provide: getRepositoryToken(Doctor), useValue: doctorRepo },
        { provide: getRepositoryToken(Specialty), useValue: specialtyRepo },
      ],
    }).compile();

    service = moduleRef.get(DoctorsService);
  });

  it('create: creates doctor when specialtyId exists', async () => {
    const specialty = { id: 2, name: 'Dermatologia' } as Specialty;
    specialtyRepo.findOne.mockResolvedValueOnce(specialty);
    const created = { name: 'Dr A', crm: '123', specialty } as Doctor;
    doctorRepo.create.mockReturnValueOnce(created);
    doctorRepo.save.mockResolvedValueOnce({ id: 10, ...created } as Doctor);

    await expect(
      service.create({ name: 'Dr A', crm: '123', specialtyId: 2 } as any),
    ).resolves.toMatchObject({ id: 10, specialty: { id: 2 } });

    expect(specialtyRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(doctorRepo.save).toHaveBeenCalled();
  });

  it('create: accepts specialty.name when specialtyId is missing', async () => {
    const specialty = { id: 3, name: 'Cardiologia' } as Specialty;
    specialtyRepo.findOne.mockResolvedValueOnce(specialty);
    doctorRepo.create.mockReturnValueOnce({} as any);
    doctorRepo.save.mockResolvedValueOnce({ id: 1, specialty } as any);

    await expect(
      service.create({ name: 'Dr B', crm: '999', specialty: { name: '  Cardiologia ' } } as any),
    ).resolves.toMatchObject({ id: 1, specialty: { id: 3 } });

    expect(specialtyRepo.findOne).toHaveBeenCalledWith({ where: { name: 'Cardiologia' } });
  });

  it('create: throws BadRequest when specialty is not provided', async () => {
    await expect(service.create({ name: 'Dr C', crm: '111' } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('findOne: throws NotFound when doctor does not exist', async () => {
    doctorRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(123)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: changes specialty when provided', async () => {
    const row = { id: 1, name: 'Dr', crm: '1', specialty: { id: 1 } } as any;
    doctorRepo.findOne.mockResolvedValueOnce(row);
    const specialty = { id: 9, name: 'Ortopedia' } as Specialty;
    specialtyRepo.findOne.mockResolvedValueOnce(specialty);
    doctorRepo.save.mockResolvedValueOnce({ ...row, specialty } as any);

    await expect(service.update(1, { specialtyId: 9 } as any)).resolves.toMatchObject({
      specialty: { id: 9 },
    });
  });

  it('remove: removes doctor when it exists', async () => {
    const row = { id: 1 } as Doctor;
    doctorRepo.findOne.mockResolvedValueOnce(row as any);
    doctorRepo.remove.mockResolvedValueOnce(row as any);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(doctorRepo.remove).toHaveBeenCalledWith(row);
  });
});

