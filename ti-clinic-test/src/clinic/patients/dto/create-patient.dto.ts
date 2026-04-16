import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  Matches,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreatePatientHealthPlanEnrollmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  healthPlanId: number;

  @ApiProperty({ example: 'CTR-2026-001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractNumber?: string;
}

export class CreatePatientDto {
  @ApiProperty({ example: 'Mary Johnson' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos numéricos' })
  cpf: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: '+55 11 99999-9999', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({
    required: false,
    type: CreatePatientHealthPlanEnrollmentDto,
    description: 'Optional enrollment in a health plan during patient creation',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePatientHealthPlanEnrollmentDto)
  healthPlanEnrollment?: CreatePatientHealthPlanEnrollmentDto;
}
