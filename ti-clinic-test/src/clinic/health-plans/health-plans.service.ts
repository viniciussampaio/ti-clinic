import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthPlan } from '../entities/health-plan.entity';
import { CreateHealthPlanDto } from './dto/create-health-plan.dto';
import { UpdateHealthPlanDto } from './dto/update-health-plan.dto';

@Injectable()
export class HealthPlansService {
  constructor(
    @InjectRepository(HealthPlan)
    private readonly repo: Repository<HealthPlan>,
  ) {}

  create(dto: CreateHealthPlanDto) {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { description: 'ASC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Health plan not found');
    }
    return row;
  }

  async update(id: number, dto: UpdateHealthPlanDto) {
    const row = await this.findOne(id);
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
