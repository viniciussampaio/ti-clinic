import { Test } from '@nestjs/testing';
import { HealthPlansController } from './health-plans.controller';
import { HealthPlansService } from './health-plans.service';

describe('HealthPlansController', () => {
  let controller: HealthPlansController;
  let service: jest.Mocked<HealthPlansService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthPlansController],
      providers: [
        {
          provide: HealthPlansService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthPlansController);
    service = moduleRef.get(HealthPlansService);
  });

  it('create: delegates to service.create', async () => {
    service.create.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.create({ description: 'Plano', phone: '1' } as any)).resolves.toEqual({
      id: 1,
    });
    expect(service.create).toHaveBeenCalledWith({ description: 'Plano', phone: '1' });
  });

  it('findAll: delegates to service.findAll', () => {
    service.findAll.mockReturnValueOnce([{ id: 1 }] as any);
    expect(controller.findAll()).toEqual([{ id: 1 }]);
  });

  it('findOne: delegates to service.findOne', async () => {
    service.findOne.mockResolvedValueOnce({ id: 2 } as any);
    await expect(controller.findOne(2)).resolves.toEqual({ id: 2 });
    expect(service.findOne).toHaveBeenCalledWith(2);
  });

  it('update: delegates to service.update', async () => {
    service.update.mockResolvedValueOnce({ id: 3 } as any);
    await expect(controller.update(3, { phone: '2' } as any)).resolves.toEqual({ id: 3 });
    expect(service.update).toHaveBeenCalledWith(3, { phone: '2' });
  });

  it('remove: delegates to service.remove', async () => {
    service.remove.mockResolvedValueOnce(undefined as any);
    await expect(controller.remove(4)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(4);
  });
});

