import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';

export class CreateConsultationDto {
  private static normalizeOptionalPositiveId(value: unknown): unknown {
    return value === '' || value === '0' || value === 0 || value == null
      ? undefined
      : value;
  }

  @ApiProperty({ example: '2026-04-14' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({
    example: '14:30:00',
    description: 'Time as HH:mm or HH:mm:ss',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'appointmentTime must be HH:mm or HH:mm:ss',
  })
  appointmentTime: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPrivatePay?: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  patientId: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Required for medical consultation. Optional for procedure-only scheduling.',
  })
  @IsOptional()
  @Transform(({ value }) =>
    CreateConsultationDto.normalizeOptionalPositiveId(value),
  )
  @IsInt()
  @IsPositive()
  doctorId?: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Required when doctorId is provided. Optional for procedure-only scheduling.',
  })
  @IsOptional()
  @Transform(({ value }) =>
    CreateConsultationDto.normalizeOptionalPositiveId(value),
  )
  @IsInt()
  @IsPositive()
  specialtyId?: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Required unless isPrivatePay is true; must belong to the same patient',
  })
  @IsOptional()
  @Transform(({ value }) =>
    CreateConsultationDto.normalizeOptionalPositiveId(value),
  )
  @IsInt()
  @IsPositive()
  patientPlanId?: number;

  @ApiPropertyOptional({
    example: [1, 2],
    description:
      'Procedure IDs to attach during consultation creation. Can be empty on update to clear procedures.',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  procedureIds?: number[];
}
