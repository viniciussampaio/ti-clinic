import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientPlanDto } from './create-patient-plan.dto';

export class UpdatePatientPlanDto extends PartialType(CreatePatientPlanDto) {}
