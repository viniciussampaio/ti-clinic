import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AttachProcedureDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  procedureId: number;
}
