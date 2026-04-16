import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { Specialty } from '../entities/specialty.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

type SpecialtyReference = {
  specialtyId?: number;
  specialty?: { id?: number; name?: string };
};

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly repo: Repository<Doctor>,
    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,
  ) {}

  private getSpecialtyReference(dto: SpecialtyReference) {
    return {
      specialtyId: dto.specialtyId ?? dto.specialty?.id ?? null,
      specialtyName: dto.specialty?.name?.trim() ?? null,
    };
  }

  private async resolveSpecialty(
    dto: SpecialtyReference,
  ): Promise<Specialty | null> {
    const { specialtyId, specialtyName } = this.getSpecialtyReference(dto);

    if (specialtyId != null) {
      const specialty = await this.specialtyRepo.findOne({
        where: { id: specialtyId },
      });
      if (!specialty) {
        throw new NotFoundException('Specialty not found');
      }
      return specialty;
    }

    if (specialtyName) {
      const specialty = await this.specialtyRepo.findOne({
        where: { name: specialtyName },
      });
      if (!specialty) {
        throw new NotFoundException('Specialty not found');
      }
      return specialty;
    }

    return null;
  }

  async create(dto: CreateDoctorDto) {
    const specialty = await this.resolveSpecialty(dto);
    if (!specialty) {
      throw new BadRequestException(
        'Informe a especialidade via specialtyId, specialty.id ou specialty.name',
      );
    }
    const row = this.repo.create({
      name: dto.name,
      crm: dto.crm,
      specialty,
    });
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({
      relations: { specialty: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: { specialty: true },
    });
    if (!row) {
      throw new NotFoundException('Doctor not found');
    }
    return row;
  }

  async update(id: number, dto: UpdateDoctorDto) {
    const row = await this.findOne(id);
    const specialty = await this.resolveSpecialty(dto);
    if (specialty != null) {
      row.specialty = specialty;
    }
    if (dto.name != null) row.name = dto.name;
    if (dto.crm != null) row.crm = dto.crm;
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
