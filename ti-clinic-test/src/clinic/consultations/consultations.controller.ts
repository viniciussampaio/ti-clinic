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
import { AttachProcedureDto } from './dto/attach-procedure.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ConsultationsService } from './consultations.service';

@ApiTags('clinic — consultations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly service: ConsultationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Schedule a consultation',
    description:
      'Send specialtyId and doctorId together. If isPrivatePay is false (default), send patientPlanId for the same patient. You can also send procedureIds to link procedures on creation.',
  })
  @ApiCreatedResponse()
  create(@Body() dto: CreateConsultationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List consultations' })
  @ApiOkResponse()
  findAll() {
    return this.service.findAll();
  }

  @Post(':consultationId/procedures')
  @ApiOperation({ summary: 'Attach procedure to consultation' })
  @ApiOkResponse()
  attachProcedure(
    @Param('consultationId', ParseIntPipe) consultationId: number,
    @Body() dto: AttachProcedureDto,
  ) {
    return this.service.attachProcedure(consultationId, dto.procedureId);
  }

  @Delete(':consultationId/procedures/:procedureId')
  @ApiOperation({
    summary: 'Remove procedure from consultation',
    description: 'Unlinks a procedure from a consultation by their ids.',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      example: {},
      description: 'No request body is required.',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Procedure unlinked from consultation successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Consultation not found or procedure is not linked.',
  })
  detachProcedure(
    @Param('consultationId', ParseIntPipe) consultationId: number,
    @Param('procedureId', ParseIntPipe) procedureId: number,
  ) {
    return this.service.detachProcedure(consultationId, procedureId);
  }

  @Get(':consultationId')
  @ApiOperation({ summary: 'Get consultation by id' })
  findOne(@Param('consultationId', ParseIntPipe) consultationId: number) {
    return this.service.findOne(consultationId);
  }

  @Patch(':consultationId')
  @ApiOperation({
    summary: 'Update consultation',
    description:
      'Updates consultation data by id, including patient, doctor/specialty pair, private pay flag, patient plan enrollment, date/time, and procedures.',
  })
  @ApiBody({
    type: UpdateConsultationDto,
    examples: {
      updateConsultation: {
        summary: 'Update appointment date, time and procedures',
        value: {
          appointmentDate: '2026-05-10',
          appointmentTime: '15:00',
          isPrivatePay: true,
          procedureIds: [1, 2],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Consultation updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({
    status: 404,
    description: 'Consultation or referenced entities not found.',
  })
  update(
    @Param('consultationId', ParseIntPipe) consultationId: number,
    @Body() dto: UpdateConsultationDto,
  ) {
    return this.service.update(consultationId, dto);
  }

  @Delete(':consultationId')
  @ApiOperation({
    summary: 'Delete consultation',
    description: 'Removes a consultation by id.',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      example: {},
      description: 'No request body is required.',
    },
  })
  @ApiResponse({ status: 200, description: 'Consultation removed successfully.' })
  @ApiResponse({ status: 404, description: 'Consultation not found.' })
  remove(@Param('consultationId', ParseIntPipe) consultationId: number) {
    return this.service.remove(consultationId);
  }
}
