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
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsService } from './patients.service';

@ApiTags('clinic — patients')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create patient' })
  @ApiBody({
    type: CreatePatientDto,
    examples: {
      withPhoneAndHealthPlan: {
        summary: 'Create patient with phone and health plan enrollment',
        value: {
          name: 'Mary Johnson',
          cpf: '12345678901',
          birthDate: '1990-05-15',
          phone: '+55 11 99999-9999',
          healthPlanEnrollment: {
            healthPlanId: 1,
            contractNumber: 'CTR-2026-001',
          },
        },
      },
      withHealthPlanWithoutContract: {
        summary: 'Create patient with health plan and no contract number yet',
        value: {
          name: 'Pedro Lima',
          cpf: '23456789012',
          birthDate: '1996-11-03',
          phone: '+55 11 96666-5555',
          healthPlanEnrollment: {
            healthPlanId: 3,
          },
        },
      },
      withPhoneOnly: {
        summary: 'Create patient with phone only',
        value: {
          name: 'John Doe',
          cpf: '34567890123',
          birthDate: '1985-10-20',
          phone: '+55 21 98888-7777',
        },
      },
      withoutPhone: {
        summary: 'Create patient without phone',
        value: {
          name: 'Ana Lima',
          cpf: '45678901234',
          birthDate: '1992-07-10',
        },
      },
    },
  })
  @ApiCreatedResponse()
  create(@Body() dto: CreatePatientDto) {
    return this.service.create(dto);
  }

  @Get('/list-patients')
  @ApiOperation({ summary: 'List patients' })
  @ApiOkResponse()
  findAllController() {
    return this.service.findAll();
  }

  @Get('/by-cpf/:cpf')
  @ApiOperation({
    summary: 'Get patient by CPF',
    description:
      'Returns patient data for front auto-fill while scheduling consultation. Accepts CPF with or without mask.',
  })
  @ApiOkResponse()
  findByCpf(@Param('cpf') cpf: string) {
    return this.service.findByCpf(cpf);
  }

  @Get(':patientId')
  @ApiOperation({ summary: 'Get patient by id' })
  findOne(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.service.findOne(patientId);
  }

  @Patch(':patientId')
  @ApiOperation({
    summary: 'Update patient',
    description:
      'Updates patient data and, when healthPlanEnrollment is provided, replaces the current health plan enrollment (latest record).',
  })
  @ApiBody({
    type: UpdatePatientDto,
    examples: {
      updateBasicData: {
        summary: 'Update patient basic data',
        value: {
          name: 'Mary Johnson Silva',
          cpf: '12345678901',
          phone: '+55 11 98888-7777',
        },
      },
      updateAndEnrollHealthPlan: {
        summary: 'Update patient and replace current health plan enrollment',
        value: {
          phone: '+55 11 97777-6666',
          healthPlanEnrollment: {
            healthPlanId: 2,
            contractNumber: 'CTR-2026-002',
          },
        },
      },
      updateAndEnrollWithoutContract: {
        summary:
          'Update patient and replace health plan without contract number',
        value: {
          healthPlanEnrollment: {
            healthPlanId: 2,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Patient updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({ status: 404, description: 'Patient or health plan not found.' })
  @ApiResponse({ status: 409, description: 'Enrollment conflict detected.' })
  @ApiResponse({
    status: 422,
    description: 'CPF already exists for another patient.',
  })
  update(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.service.update(patientId, dto);
  }

  @Delete(':patientId')
  @ApiOperation({
    summary: 'Delete patient',
    description:
      'Removes a patient by id. The operation is blocked if there are linked consultations.',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      example: {},
      description: 'No request body is required.',
    },
  })
  @ApiResponse({ status: 200, description: 'Patient removed successfully.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiResponse({
    status: 409,
    description: 'Patient has linked consultations and cannot be removed.',
  })
  remove(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.service.remove(patientId);
  }
}
