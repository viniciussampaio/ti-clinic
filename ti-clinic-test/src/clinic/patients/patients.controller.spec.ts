import { Test } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: jest.Mocked<PatientsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByCpf: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(PatientsController);
    service = moduleRef.get(PatientsService);
  });

  it('create: delegates to service.create', async () => {
    service.create.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.create({ name: 'A', cpf: '1', birthDate: '2000-01-01' } as any)).resolves.toEqual({
      id: 1,
    });
    expect(service.create).toHaveBeenCalledWith({ name: 'A', cpf: '1', birthDate: '2000-01-01' });
  });

  it('findAllController: delegates to service.findAll', async () => {
    service.findAll.mockResolvedValueOnce([{ id: 1 }] as any);
    await expect(controller.findAllController()).resolves.toEqual([{ id: 1 }]);
  });

  it('findByCpf: delegates to service.findByCpf', async () => {
    service.findByCpf.mockResolvedValueOnce({ id: 2 } as any);
    await expect(controller.findByCpf('123')).resolves.toEqual({ id: 2 });
    expect(service.findByCpf).toHaveBeenCalledWith('123');
  });

  it('findOne: delegates to service.findOne', async () => {
    service.findOne.mockResolvedValueOnce({ id: 3 } as any);
    await expect(controller.findOne(3)).resolves.toEqual({ id: 3 });
    expect(service.findOne).toHaveBeenCalledWith(3);
  });

  it('update: delegates to service.update', async () => {
    service.update.mockResolvedValueOnce({ id: 4 } as any);
    await expect(controller.update(4, { phone: 'x' } as any)).resolves.toEqual({ id: 4 });
    expect(service.update).toHaveBeenCalledWith(4, { phone: 'x' });
  });

  it('remove: delegates to service.remove', async () => {
    service.remove.mockResolvedValueOnce(undefined as any);
    await expect(controller.remove(5)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(5);
  });
});

