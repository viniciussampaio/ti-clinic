import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePatientPlanDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  patientId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  healthPlanId: number;

  @ApiProperty({ example: 'CTR-2024-001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractNumber?: string;
}
