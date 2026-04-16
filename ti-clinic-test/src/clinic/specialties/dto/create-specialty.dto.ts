import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  @MaxLength(255)
  name: string;
}
