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
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorsService } from './doctors.service';

@ApiTags('clinic — doctors')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly service: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create doctor' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateDoctorDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List doctors' })
  @ApiOkResponse()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update doctor',
    description:
      'Updates one or more doctor fields by id, including name, CRM, and specialtyId.',
  })
  @ApiBody({
    type: UpdateDoctorDto,
    examples: {
      updateDoctor: {
        summary: 'Update doctor CRM and specialty',
        value: { crm: 'CRM-12345', specialtyId: 2 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({ status: 404, description: 'Doctor or specialty not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDoctorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete doctor',
    description: 'Removes a doctor by id.',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      example: {},
      description: 'No request body is required.',
    },
  })
  @ApiResponse({ status: 200, description: 'Doctor removed successfully.' })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
