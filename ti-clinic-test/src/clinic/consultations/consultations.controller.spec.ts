import { Test } from '@nestjs/testing';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';

describe('ConsultationsController', () => {
  let controller: ConsultationsController;
  let service: jest.Mocked<ConsultationsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ConsultationsController],
      providers: [
        {
          provide: ConsultationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            attachProcedure: jest.fn(),
            detachProcedure: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(ConsultationsController);
    service = moduleRef.get(ConsultationsService);
  });

  it('create: delegates to service.create', async () => {
    service.create.mockResolvedValueOnce({ id: 1 } as any);
    await expect(
      controller.create({
        appointmentDate: '2026-04-14',
        appointmentTime: '10:15',
        patientId: 1,
        isPrivatePay: true,
      } as any),
    ).resolves.toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalled();
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
    await expect(controller.update(3, { appointmentDate: '2026-05-01' } as any)).resolves.toEqual({
      id: 3,
    });
    expect(service.update).toHaveBeenCalledWith(3, { appointmentDate: '2026-05-01' });
  });

  it('remove: delegates to service.remove', async () => {
    service.remove.mockResolvedValueOnce(undefined as any);
    await expect(controller.remove(4)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(4);
  });

  it('attachProcedure: delegates to service.attachProcedure', async () => {
    service.attachProcedure.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.attachProcedure(10, { procedureId: 2 } as any)).resolves.toEqual({ id: 1 });
    expect(service.attachProcedure).toHaveBeenCalledWith(10, 2);
  });

  it('detachProcedure: delegates to service.detachProcedure', async () => {
    service.detachProcedure.mockResolvedValueOnce(undefined as any);
    await expect(controller.detachProcedure(10, 2)).resolves.toBeUndefined();
    expect(service.detachProcedure).toHaveBeenCalledWith(10, 2);
  });
});

