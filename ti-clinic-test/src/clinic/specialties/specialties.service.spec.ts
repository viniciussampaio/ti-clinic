import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Specialty } from '../entities/specialty.entity';
import { SpecialtiesService } from './specialties.service';

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

describe('SpecialtiesService', () => {
  let service: SpecialtiesService;
  let repo: jest.Mocked<RepoMock<Specialty>>;

  beforeEach(async () => {
    repo = createRepoMock<Specialty>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SpecialtiesService,
        { provide: getRepositoryToken(Specialty), useValue: repo },
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
});

