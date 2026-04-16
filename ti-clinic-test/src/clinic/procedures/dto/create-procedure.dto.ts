import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateProcedureDto {
  @ApiProperty({ example: 'Routine checkup' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}
