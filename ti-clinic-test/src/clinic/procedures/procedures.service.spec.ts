import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Procedure } from '../entities/procedure.entity';
import { ProceduresService } from './procedures.service';

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

describe('ProceduresService', () => {
  let service: ProceduresService;
  let repo: jest.Mocked<RepoMock<Procedure>>;

  beforeEach(async () => {
    repo = createRepoMock<Procedure>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProceduresService,
        { provide: getRepositoryToken(Procedure), useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(ProceduresService);
  });

  it('create: saves price as decimal string with 2 places', async () => {
    repo.create.mockImplementation((v: any) => v);
    repo.save.mockResolvedValueOnce({ id: 1, name: 'X', price: '10.50' } as any);

    await expect(service.create({ name: 'X', price: 10.5 } as any)).resolves.toMatchObject({
      price: '10.50',
    });
    expect(repo.create).toHaveBeenCalledWith({ name: 'X', price: '10.50' });
  });

  it('findOne: throws NotFound when procedure does not exist', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: updates name and price when provided', async () => {
    const row = { id: 1, name: 'A', price: '1.00' } as any;
    repo.findOne.mockResolvedValueOnce(row);
    repo.save.mockResolvedValueOnce({ ...row, name: 'B', price: '2.50' } as any);

    await expect(service.update(1, { name: 'B', price: 2.5 } as any)).resolves.toMatchObject({
      name: 'B',
      price: '2.50',
    });
  });
});

