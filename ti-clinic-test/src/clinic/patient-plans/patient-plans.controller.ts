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
import { CreatePatientPlanDto } from './dto/create-patient-plan.dto';
import { UpdatePatientPlanDto } from './dto/update-patient-plan.dto';
import { PatientPlansService } from './patient-plans.service';

@ApiTags('clinic — patient plan enrollments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('patient-plans')
export class PatientPlansController {
  constructor(private readonly service: PatientPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll patient in a health plan' })
  @ApiCreatedResponse()
  create(@Body() dto: CreatePatientPlanDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List enrollments' })
  @ApiOkResponse()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update enrollment',
    description:
      'Updates the health plan enrollment by id, including healthPlanId and contractNumber.',
  })
  @ApiBody({
    type: UpdatePatientPlanDto,
    examples: {
      updateEnrollment: {
        summary: 'Update health plan enrollment contract',
        value: { healthPlanId: 2, contractNumber: 'CTR-2026-010' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Enrollment updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({
    status: 404,
    description: 'Enrollment, patient, or health plan not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Enrollment already exists for patient/plan/contract.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePatientPlanDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete enrollment',
    description: 'Removes a patient health plan enrollment by id.',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      example: {},
      description: 'No request body is required.',
    },
  })
  @ApiResponse({ status: 200, description: 'Enrollment removed successfully.' })
  @ApiResponse({ status: 404, description: 'Enrollment not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
