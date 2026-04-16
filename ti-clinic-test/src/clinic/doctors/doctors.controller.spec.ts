import { Test } from '@nestjs/testing';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';

describe('DoctorsController', () => {
  let controller: DoctorsController;
  let service: jest.Mocked<DoctorsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DoctorsController],
      providers: [
        {
          provide: DoctorsService,
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

    controller = moduleRef.get(DoctorsController);
    service = moduleRef.get(DoctorsService);
  });

  it('create: delegates to service.create', async () => {
    service.create.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.create({ name: 'Dr', crm: '1', specialtyId: 1 } as any)).resolves.toEqual({
      id: 1,
    });
    expect(service.create).toHaveBeenCalledWith({ name: 'Dr', crm: '1', specialtyId: 1 });
  });

  it('findAll: delegates to service.findAll', () => {
    service.findAll.mockReturnValueOnce([{ id: 1 }] as any);
    expect(controller.findAll()).toEqual([{ id: 1 }]);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne: delegates to service.findOne', async () => {
    service.findOne.mockResolvedValueOnce({ id: 2 } as any);
    await expect(controller.findOne(2)).resolves.toEqual({ id: 2 });
    expect(service.findOne).toHaveBeenCalledWith(2);
  });

  it('update: delegates to service.update', async () => {
    service.update.mockResolvedValueOnce({ id: 3, name: 'X' } as any);
    await expect(controller.update(3, { name: 'X' } as any)).resolves.toEqual({ id: 3, name: 'X' });
    expect(service.update).toHaveBeenCalledWith(3, { name: 'X' });
  });

  it('remove: delegates to service.remove', async () => {
    service.remove.mockResolvedValueOnce(undefined as any);
    await expect(controller.remove(4)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(4);
  });
});

