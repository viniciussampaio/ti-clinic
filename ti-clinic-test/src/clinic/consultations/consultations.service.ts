import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Consultation } from '../entities/consultation.entity';
import { Doctor } from '../entities/doctor.entity';
import { PatientPlan } from '../entities/patient-plan.entity';
import { Patient } from '../entities/patient.entity';
import { Procedure } from '../entities/procedure.entity';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

const consultationRelations = {
  patient: true,
  doctor: { specialty: true },
  patientPlan: { healthPlan: true },
  procedures: true,
} as const;

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private readonly repo: Repository<Consultation>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(PatientPlan)
    private readonly patientPlanRepo: Repository<PatientPlan>,
    @InjectRepository(Procedure)
    private readonly procedureRepo: Repository<Procedure>,
  ) {}

  private async resolveProcedures(procedureIds?: number[]) {
    if (procedureIds === undefined) {
      return undefined;
    }

    if (procedureIds.length === 0) {
      return [];
    }

    const uniqueIds = [...new Set(procedureIds)];
    const procedures = await this.procedureRepo.find({
      where: { id: In(uniqueIds) },
    });

    if (procedures.length !== uniqueIds.length) {
      const foundIds = new Set(procedures.map((procedure) => procedure.id));
      const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Procedimento(s) não encontrado(s): ${missingIds.join(', ')}`,
      );
    }

    return procedures;
  }

  private async resolveConsultationReferences(dto: {
    patientId: number;
    doctorId?: number;
    specialtyId?: number;
    patientPlanId?: number;
    isPrivatePay: boolean;
  }) {
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    let doctor: Doctor | null = null;
    const hasDoctorId = dto.doctorId != null;
    const hasSpecialtyId = dto.specialtyId != null;

    if (hasDoctorId !== hasSpecialtyId) {
      throw new BadRequestException(
        'Provide doctorId and specialtyId together for medical consultations',
      );
    }

    if (hasDoctorId && hasSpecialtyId) {
      const doctorId = dto.doctorId as number;
      const specialtyId = dto.specialtyId as number;
      doctor = await this.doctorRepo.findOne({
        where: { id: doctorId },
        relations: { specialty: true },
      });
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }
      if (!doctor.specialty || doctor.specialty.id !== specialtyId) {
        throw new BadRequestException(
          'Selected doctor does not belong to the provided specialty',
        );
      }
    }

    if (dto.isPrivatePay) {
      return { patient, doctor, patientPlan: null, isPrivatePay: true };
    }

    if (dto.patientPlanId == null) {
      throw new BadRequestException(
        'Provide patientPlanId or set isPrivatePay to true',
      );
    }

    const patientPlan = await this.patientPlanRepo.findOne({
      where: { id: dto.patientPlanId },
      relations: { patient: true },
    });
    if (!patientPlan) {
      throw new NotFoundException('Patient plan enrollment not found');
    }
    if (patientPlan.patient.id !== dto.patientId) {
      throw new BadRequestException(
        'The enrollment does not belong to the given patient',
      );
    }
    return { patient, doctor, patientPlan, isPrivatePay: false };
  }

  async create(dto: CreateConsultationDto) {
    const isPrivatePay = dto.isPrivatePay === true;
    const refs = await this.resolveConsultationReferences({
      patientId: Number(dto.patientId),
      doctorId: dto.doctorId,
      specialtyId: dto.specialtyId,
      patientPlanId: dto.patientPlanId,
      isPrivatePay,
    });
    const time =
      dto.appointmentTime.length === 5
        ? `${dto.appointmentTime}:00`
        : dto.appointmentTime;
    const procedures = await this.resolveProcedures(dto.procedureIds);
    const row = this.repo.create({
      appointmentDate: dto.appointmentDate,
      appointmentTime: time,
      isPrivatePay: refs.isPrivatePay,
      patient: refs.patient,
      doctor: refs.doctor,
      patientPlan: refs.patientPlan,
      procedures: procedures ?? [],
    });
    const saved = await this.repo.save(row);
    return this.findOne(saved.id);
  }

  findAll() {
    return this.repo.find({
      relations: consultationRelations,
      order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: consultationRelations,
    });
    if (!row) {
      throw new NotFoundException('Consultation not found');
    }
    return row;
  }

  async update(id: number, dto: UpdateConsultationDto) {
    const row = await this.findOne(id);
    const patientId = dto.patientId ?? row.patient.id;
    const doctorId = dto.doctorId ?? row.doctor?.id;
    const specialtyId = dto.specialtyId ?? row.doctor?.specialty?.id;
    const isPrivatePay =
      dto.isPrivatePay !== undefined
        ? Boolean(dto.isPrivatePay)
        : Boolean(row.isPrivatePay);

    let patientPlanId: number | undefined;
    if (isPrivatePay) {
      patientPlanId = undefined;
    } else if (dto.patientPlanId !== undefined) {
      patientPlanId = dto.patientPlanId;
    } else {
      patientPlanId = row.patientPlan?.id;
    }

    const refs = await this.resolveConsultationReferences({
      patientId,
      doctorId,
      specialtyId,
      patientPlanId,
      isPrivatePay,
    });

    if (dto.appointmentDate != null) {
      row.appointmentDate = dto.appointmentDate;
    }
    if (dto.appointmentTime != null) {
      row.appointmentTime =
        dto.appointmentTime.length === 5
          ? `${dto.appointmentTime}:00`
          : dto.appointmentTime;
    }
    row.isPrivatePay = refs.isPrivatePay;
    row.patient = refs.patient;
    row.doctor = refs.doctor;
    row.patientPlan = refs.patientPlan;
    if (dto.procedureIds !== undefined) {
      row.procedures = (await this.resolveProcedures(dto.procedureIds)) ?? [];
    }
    await this.repo.save(row);
    return this.findOne(id);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }

  async attachProcedure(consultationId: number, procedureId: number) {
    const consultation = await this.repo.findOne({
      where: { id: consultationId },
      relations: { procedures: true },
    });
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    const procedure = await this.procedureRepo.findOne({
      where: { id: procedureId },
    });
    if (!procedure) {
      throw new NotFoundException('Procedure not found');
    }
    const alreadyLinked = consultation.procedures.some(
      (p) => p.id === procedureId,
    );
    if (alreadyLinked) {
      throw new BadRequestException(
        'This procedure is already linked to the consultation',
      );
    }
    consultation.procedures.push(procedure);
    await this.repo.save(consultation);
    return this.findOne(consultationId);
  }

  async detachProcedure(consultationId: number, procedureId: number) {
    const consultation = await this.repo.findOne({
      where: { id: consultationId },
      relations: { procedures: true },
    });
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    const before = consultation.procedures.length;
    consultation.procedures = consultation.procedures.filter(
      (p) => p.id !== procedureId,
    );
    if (consultation.procedures.length === before) {
      throw new NotFoundException(
        'Procedure is not linked to this consultation',
      );
    }
    await this.repo.save(consultation);
  }
}
