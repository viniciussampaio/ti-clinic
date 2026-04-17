import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { HealthPlan } from '../entities/health-plan.entity';
import { Patient } from '../entities/patient.entity';
import { PatientPlan } from '../entities/patient-plan.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

type CurrentHealthPlan = {
  enrollmentId: number;
  healthPlanId: number;
  description: string;
  phone: string;
  contractNumber: string | null;
} | null;

type PatientWithCurrentHealthPlan = Patient & {
  currentHealthPlan: CurrentHealthPlan;
};

@Injectable()
export class PatientsService {
  private readonly patientRelations = {
    patientPlans: { healthPlan: true },
  } as const;

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Patient)
    private readonly repo: Repository<Patient>,
  ) {}

  async create(dto: CreatePatientDto) {
    const patientId = await this.dataSource.transaction(async (manager) => {
      const row = manager.create(Patient, {
        name: dto.name,
        cpf: dto.cpf,
        birthDate: dto.birthDate,
        phone: dto.phone ?? null,
      });
      let createdPatient: Patient;
      try {
        createdPatient = await manager.save(Patient, row);
      } catch (error) {
        if (this.isDuplicateCpfError(error)) {
          throw new UnprocessableEntityException(
            'CPF já cadastrado para outro paciente',
          );
        }
        throw error;
      }

      if (!dto.healthPlanEnrollment) {
        return createdPatient.id;
      }

      const healthPlan = await manager.findOne(HealthPlan, {
        where: { id: dto.healthPlanEnrollment.healthPlanId },
      });
      if (!healthPlan) {
        throw new NotFoundException('Health plan not found');
      }

      const enrollment = manager.create(PatientPlan, {
        patient: createdPatient,
        healthPlan,
        contractNumber: dto.healthPlanEnrollment.contractNumber ?? null,
      });

      try {
        await manager.save(PatientPlan, enrollment);
      } catch (error) {
        if (
          error instanceof QueryFailedError &&
          (error as QueryFailedError & { driverError?: { errno?: number } })
            .driverError?.errno === 1062
        ) {
          throw new ConflictException(
            'A record already exists for this patient, health plan, and contract number',
          );
        }
        throw error;
      }

      return createdPatient.id;
    });

    return this.findOne(Number(patientId));
  }

  async findAll() {
    const patients = await this.repo.find({
      relations: this.patientRelations,
      order: { name: 'desc' },
    });
    return patients.map((patient) => this.toResponse(patient));
  }

  async findOne(id: number) {
    const row = await this.findOneEntity(id);
    return this.toResponse(row);
  }

  async findByCpf(rawCpf: string) {
    const normalizedCpf = this.normalizeCpf(rawCpf);
    const row = await this.repo.findOne({
      where: { cpf: normalizedCpf },
      relations: this.patientRelations,
    });
    if (!row) {
      throw new NotFoundException(
        'Paciente não encontrado para o CPF informado',
      );
    }
    return this.toResponse(row);
  }

  async update(id: number, dto: UpdatePatientDto) {
    await this.dataSource.transaction(async (manager) => {
      const row = await manager.findOne(Patient, {
        where: { id },
        relations: this.patientRelations,
      });
      if (!row) {
        throw new NotFoundException('Patient not found');
      }

      if (dto.name !== undefined) {
        row.name = dto.name;
      }
      if (dto.cpf !== undefined) {
        row.cpf = dto.cpf;
      }
      if (dto.birthDate !== undefined) {
        row.birthDate = dto.birthDate;
      }
      if (dto.phone !== undefined) {
        row.phone = dto.phone ?? null;
      }
      try {
        await manager.save(Patient, row);
      } catch (error) {
        if (this.isDuplicateCpfError(error)) {
          throw new UnprocessableEntityException(
            'CPF já cadastrado para outro paciente',
          );
        }
        throw error;
      }

      if (!dto.healthPlanEnrollment) {
        return;
      }

      const healthPlan = await manager.findOne(HealthPlan, {
        where: { id: dto.healthPlanEnrollment.healthPlanId },
      });
      if (!healthPlan) {
        throw new NotFoundException('Health plan not found');
      }

      const latestEnrollment = [...(row.patientPlans ?? [])].sort(
        (a, b) => b.id - a.id,
      )[0];

      const enrollment = latestEnrollment
        ? manager.merge(PatientPlan, latestEnrollment, {
            healthPlan,
            contractNumber: dto.healthPlanEnrollment.contractNumber ?? null,
          })
        : manager.create(PatientPlan, {
            patient: row,
            healthPlan,
            contractNumber: dto.healthPlanEnrollment.contractNumber ?? null,
          });
      try {
        await manager.save(PatientPlan, enrollment);
      } catch (error) {
        if (
          error instanceof QueryFailedError &&
          (error as QueryFailedError & { driverError?: { errno?: number } })
            .driverError?.errno === 1062
        ) {
          throw new ConflictException(
            'A record already exists for this patient, health plan, and contract number',
          );
        }
        throw error;
      }
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const row = await this.findOneEntity(id);
    try {
      await this.repo.remove(row);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { errno?: number } })
          .driverError?.errno === 1451
      ) {
        throw new ConflictException(
          'Paciente não pode ser removido porque possui consultas vinculadas',
        );
      }
      throw error;
    }
  }

  private async findOneEntity(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: this.patientRelations,
    });
    if (!row) {
      throw new NotFoundException('Patient not found');
    }
    return row;
  }

  private toResponse(patient: Patient): PatientWithCurrentHealthPlan {
    return {
      ...patient,
      currentHealthPlan: this.resolveCurrentHealthPlan(patient),
    };
  }

  private normalizeCpf(value: string): string {
    return value.replace(/\D/g, '');
  }

  private resolveCurrentHealthPlan(patient: Patient): CurrentHealthPlan {
    if (!patient.patientPlans?.length) {
      return null;
    }

    const latestEnrollment = [...patient.patientPlans].sort(
      (a, b) => b.id - a.id,
    )[0];

    if (!latestEnrollment?.healthPlan) {
      return null;
    }

    return {
      enrollmentId: latestEnrollment.id,
      healthPlanId: latestEnrollment.healthPlan.id,
      description: latestEnrollment.healthPlan.description,
      phone: latestEnrollment.healthPlan.phone,
      contractNumber: latestEnrollment.contractNumber,
    };
  }

  private isDuplicateCpfError(error: unknown): boolean {
    if (!this.isDuplicateEntryError(error)) {
      return false;
    }

    const queryError = error as QueryFailedError & {
      driverError?: { sqlMessage?: string; message?: string };
    };
    const duplicateMessage = (
      queryError.driverError?.sqlMessage ??
      queryError.driverError?.message ??
      ''
    ).toLowerCase();

    return duplicateMessage.includes('cpf');
  }

  private isDuplicateEntryError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { driverError?: { errno?: number } })
        .driverError?.errno === 1062
    );
  }
}
