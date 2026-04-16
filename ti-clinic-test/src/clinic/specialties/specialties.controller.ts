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
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { SpecialtiesService } from './specialties.service';

@ApiTags('clinic — specialties')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly service: SpecialtiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create specialty' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateSpecialtyDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List specialties' })
  @ApiOkResponse()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specialty by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update specialty',
    description: 'Updates one or more specialty fields by id.',
  })
  @ApiBody({
    type: UpdateSpecialtyDto,
    examples: {
      updateSpecialty: {
        summary: 'Update specialty name',
        value: { name: 'Dermatologia Pediátrica' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Specialty updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({ status: 404, description: 'Specialty not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpecialtyDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete specialty',
    description: 'Removes a specialty by id.',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      example: {},
      description: 'No request body is required.',
    },
  })
  @ApiResponse({ status: 200, description: 'Specialty removed successfully.' })
  @ApiResponse({ status: 404, description: 'Specialty not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
