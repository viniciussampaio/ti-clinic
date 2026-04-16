import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../login/guards/jwt-auth.guard';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ProceduresService } from './procedures.service';

@ApiTags('clinic — procedures')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('procedures')
export class ProceduresController {
  constructor(private readonly service: ProceduresService) {}

  @Post()
  @ApiOperation({ summary: 'Create procedure' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateProcedureDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List procedures' })
  @ApiOkResponse()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get procedure by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update procedure',
    description:
      'Updates one or more procedure fields by id, such as name and price.',
  })
  @ApiBody({
    type: UpdateProcedureDto,
    examples: {
      updateProcedure: {
        summary: 'Update procedure name and price',
        value: { name: 'Exame clínico avançado', price: 250 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Procedure updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({ status: 404, description: 'Procedure not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProcedureDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete procedure',
    description: 'Removes a procedure by id.',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      example: {},
      description: 'No request body is required.',
    },
  })
  @ApiResponse({ status: 200, description: 'Procedure removed successfully.' })
  @ApiResponse({ status: 404, description: 'Procedure not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
