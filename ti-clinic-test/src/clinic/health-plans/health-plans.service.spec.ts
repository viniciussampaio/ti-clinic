import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { HealthPlan } from '../entities/health-plan.entity';
import { HealthPlansService } from './health-plans.service';

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

describe('HealthPlansService', () => {
  let service: HealthPlansService;
  let repo: jest.Mocked<RepoMock<HealthPlan>>;

  beforeEach(async () => {
    repo = createRepoMock<HealthPlan>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthPlansService,
        { provide: getRepositoryToken(HealthPlan), useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(HealthPlansService);
  });

  it('findOne: throws NotFound when health plan does not exist', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: merges dto into entity and saves', async () => {
    const row = { id: 1, description: 'A', phone: '1' } as any;
    repo.findOne.mockResolvedValueOnce(row);
    repo.save.mockResolvedValueOnce({ ...row, description: 'B' } as any);

    await expect(service.update(1, { description: 'B' } as any)).resolves.toMatchObject({
      description: 'B',
    });
    expect(repo.save).toHaveBeenCalled();
  });
});

