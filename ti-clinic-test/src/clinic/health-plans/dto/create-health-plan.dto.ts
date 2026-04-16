import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateHealthPlanDto {
  @ApiProperty({ example: 'Basic Care Plan' })
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({ example: '1-800-555-0100' })
  @IsString()
  @MaxLength(30)
  phone: string;
}
