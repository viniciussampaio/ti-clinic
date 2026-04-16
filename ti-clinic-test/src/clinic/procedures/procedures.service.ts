import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedure } from '../entities/procedure.entity';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

function toDecimalString(value: number): string {
  return value.toFixed(2);
}

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedure)
    private readonly repo: Repository<Procedure>,
  ) {}

  create(dto: CreateProcedureDto) {
    const row = this.repo.create({
      name: dto.name,
      price: toDecimalString(dto.price),
    });
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Procedure not found');
    }
    return row;
  }

  async update(id: number, dto: UpdateProcedureDto) {
    const row = await this.findOne(id);
    if (dto.name != null) {
      row.name = dto.name;
    }
    if (dto.price != null) {
      row.price = toDecimalString(dto.price);
    }
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
