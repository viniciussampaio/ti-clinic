import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { Specialty } from '../entities/specialty.entity';
import { SpecialtiesService } from './specialties.service';

type RepoMock<T> = Pick<
  Repository<T>,
  'create' | 'save' | 'find' | 'findOne' | 'remove' | 'count'
>;

function createRepoMock<T extends object>(): jest.Mocked<RepoMock<T>> {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };
}

describe('SpecialtiesService', () => {
  let service: SpecialtiesService;
  let repo: jest.Mocked<RepoMock<Specialty>>;
  let doctorRepo: jest.Mocked<RepoMock<Doctor>>;

  beforeEach(async () => {
    repo = createRepoMock<Specialty>();
    doctorRepo = createRepoMock<Doctor>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SpecialtiesService,
        { provide: getRepositoryToken(Specialty), useValue: repo },
        { provide: getRepositoryToken(Doctor), useValue: doctorRepo },
      ],
    }).compile();
    service = moduleRef.get(SpecialtiesService);
  });

  it('findOne: throws NotFound when specialty does not exist', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: updates fields and saves', async () => {
    const row = { id: 1, name: 'A' } as any;
    repo.findOne.mockResolvedValueOnce(row);
    repo.save.mockResolvedValueOnce({ ...row, name: 'B' } as any);

    await expect(service.update(1, { name: 'B' } as any)).resolves.toMatchObject({ name: 'B' });
  });

  it('remove: throws Conflict when a doctor uses the specialty', async () => {
    const row = { id: 3, name: 'Cardio' } as Specialty;
    repo.findOne.mockResolvedValueOnce(row);
    doctorRepo.count.mockResolvedValueOnce(1);

    await expect(service.remove(3)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('remove: deletes when no doctor references the specialty', async () => {
    const row = { id: 3, name: 'Cardio' } as Specialty;
    repo.findOne.mockResolvedValueOnce(row);
    doctorRepo.count.mockResolvedValueOnce(0);
    repo.remove.mockResolvedValueOnce(row);

    await expect(service.remove(3)).resolves.toBeUndefined();
    expect(repo.remove).toHaveBeenCalledWith(row);
  });
});

