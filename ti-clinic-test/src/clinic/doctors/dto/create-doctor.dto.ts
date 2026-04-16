import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class DoctorSpecialtyRefDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @ApiPropertyOptional({ example: 'Cardiology' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. Jane Smith' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'CRM-SP 123456' })
  @IsString()
  @MaxLength(50)
  crm: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  specialtyId?: number;

  @ApiPropertyOptional({
    example: { id: 1 },
    description: 'Alternative way to send specialty reference (id or name)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DoctorSpecialtyRefDto)
  specialty?: DoctorSpecialtyRefDto;
}
