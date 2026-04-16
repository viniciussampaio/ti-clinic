import { Test } from '@nestjs/testing';
import { PatientPlansController } from './patient-plans.controller';
import { PatientPlansService } from './patient-plans.service';

describe('PatientPlansController', () => {
  let controller: PatientPlansController;
  let service: jest.Mocked<PatientPlansService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PatientPlansController],
      providers: [
        {
          provide: PatientPlansService,
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

    controller = moduleRef.get(PatientPlansController);
    service = moduleRef.get(PatientPlansService);
  });

  it('create: delegates to service.create', async () => {
    service.create.mockResolvedValueOnce({ id: 1 } as any);
    await expect(
      controller.create({ patientId: 1, healthPlanId: 2, contractNumber: 'X' } as any),
    ).resolves.toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalledWith({ patientId: 1, healthPlanId: 2, contractNumber: 'X' });
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
    await expect(controller.update(3, { contractNumber: 'Y' } as any)).resolves.toEqual({ id: 3 });
    expect(service.update).toHaveBeenCalledWith(3, { contractNumber: 'Y' });
  });

  it('remove: delegates to service.remove', async () => {
    service.remove.mockResolvedValueOnce(undefined as any);
    await expect(controller.remove(4)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(4);
  });
});

