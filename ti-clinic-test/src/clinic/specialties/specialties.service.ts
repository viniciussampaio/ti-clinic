import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { Specialty } from '../entities/specialty.entity';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly repo: Repository<Specialty>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  create(dto: CreateSpecialtyDto) {
    const row = this.repo.create({ name: dto.name });
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Specialty not found');
    }
    return row;
  }

  async update(id: number, dto: UpdateSpecialtyDto) {
    const row = await this.findOne(id);
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    const doctorsCount = await this.doctorRepo.count({
      where: { specialty: { id } },
    });
    if (doctorsCount > 0) {
      throw new ConflictException(
        'Não é possível excluir esta especialidade: existe médico vinculado.',
      );
    }
    await this.repo.remove(row);
  }
}
