import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { HealthPlan } from '../entities/health-plan.entity';
import { PatientPlan } from '../entities/patient-plan.entity';
import { Patient } from '../entities/patient.entity';
import { CreatePatientPlanDto } from './dto/create-patient-plan.dto';
import { UpdatePatientPlanDto } from './dto/update-patient-plan.dto';

@Injectable()
export class PatientPlansService {
  constructor(
    @InjectRepository(PatientPlan)
    private readonly repo: Repository<PatientPlan>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(HealthPlan)
    private readonly healthPlanRepo: Repository<HealthPlan>,
  ) {}

  async create(dto: CreatePatientPlanDto) {
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    const healthPlan = await this.healthPlanRepo.findOne({
      where: { id: dto.healthPlanId },
    });
    if (!healthPlan) {
      throw new NotFoundException('Health plan not found');
    }
    const row = this.repo.create({
      patient,
      healthPlan,
      contractNumber: dto.contractNumber ?? null,
    });
    try {
      return await this.repo.save(row);
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        (e as QueryFailedError & { driverError?: { errno?: number } })
          .driverError?.errno === 1062
      ) {
        throw new ConflictException(
          'A record already exists for this patient, health plan, and contract number',
        );
      }
      throw e;
    }
  }

  findAll() {
    return this.repo.find({
      relations: { patient: true, healthPlan: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: { patient: true, healthPlan: true },
    });
    if (!row) {
      throw new NotFoundException('Patient plan enrollment not found');
    }
    return row;
  }

  async update(id: number, dto: UpdatePatientPlanDto) {
    const row = await this.findOne(id);
    if (dto.patientId != null) {
      const patient = await this.patientRepo.findOne({
        where: { id: dto.patientId },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      row.patient = patient;
    }
    if (dto.healthPlanId != null) {
      const healthPlan = await this.healthPlanRepo.findOne({
        where: { id: dto.healthPlanId },
      });
      if (!healthPlan) {
        throw new NotFoundException('Health plan not found');
      }
      row.healthPlan = healthPlan;
    }
    if (dto.contractNumber !== undefined) {
      row.contractNumber = dto.contractNumber ?? null;
    }
    try {
      return await this.repo.save(row);
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        (e as QueryFailedError & { driverError?: { errno?: number } })
          .driverError?.errno === 1062
      ) {
        throw new ConflictException(
          'A record already exists for this patient, health plan, and contract number',
        );
      }
      throw e;
    }
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
