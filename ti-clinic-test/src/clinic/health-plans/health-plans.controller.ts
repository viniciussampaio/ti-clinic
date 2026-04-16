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
import { CreateHealthPlanDto } from './dto/create-health-plan.dto';
import { UpdateHealthPlanDto } from './dto/update-health-plan.dto';
import { HealthPlansService } from './health-plans.service';

@ApiTags('clinic — health plans')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('health-plans')
export class HealthPlansController {
  constructor(private readonly service: HealthPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create health plan' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateHealthPlanDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List health plans' })
  @ApiOkResponse()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get health plan by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update health plan',
    description:
      'Updates one or more health plan fields by id, such as description and phone.',
  })
  @ApiBody({
    type: UpdateHealthPlanDto,
    examples: {
      updateHealthPlan: {
        summary: 'Update health plan contact',
        value: { description: 'Plano Premium', phone: '+55 11 4000-1234' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Health plan updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({ status: 404, description: 'Health plan not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHealthPlanDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete health plan',
    description: 'Removes a health plan by id.',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      example: {},
      description: 'No request body is required.',
    },
  })
  @ApiResponse({ status: 200, description: 'Health plan removed successfully.' })
  @ApiResponse({ status: 404, description: 'Health plan not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
