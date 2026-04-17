import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { RegisterLoginDto } from './dto/register-login.dto';
import type { ILoginService } from './login.service.interface';
import { LoginService } from './login.service';
import type {
  LoginTokenResult,
  RegisterResult,
} from './types/auth-response.types';

@ApiTags('login')
@Controller('login')
export class LoginController {
  constructor(
    @Inject(LoginService) private readonly loginService: ILoginService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiBody({
    type: RegisterLoginDto,
    examples: {
      withDisplayName: {
        summary: 'With display name',
        description: 'Registration including display name',
        value: {
          email: 'jane@clinic.com',
          password: 'StrongPass99',
          displayName: 'Jane Doe',
        },
      },
      emailPasswordOnly: {
        summary: 'Email and password only',
        value: {
          email: 'john@clinic.com',
          password: 'AnotherP@ss1',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Account created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
        displayName: { type: 'string', nullable: true },
      },
    },
  })
  @ApiConflictResponse({ description: 'Email already registered' })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  register(@Body() dto: RegisterLoginDto): Promise<RegisterResult> {
    return this.loginService.register(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Authenticate and obtain JWT' })
  @ApiBody({
    type: LoginCredentialsDto,
    examples: {
      userA: {
        summary: 'Sample user A',
        value: {
          email: 'mary.smith@clinic.com',
          password: 'SecurePass1',
        },
      },
      userB: {
        summary: 'Sample user B',
        value: {
          email: 'john.doe@clinic.com',
          password: 'MyPassw@rd123',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Access token and public user profile',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            displayName: { type: 'string', nullable: true },
          },
        },
        token_type: { type: 'string', example: 'Bearer' },
        expires_in: { type: 'number', example: 3600 },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  authenticate(@Body() dto: LoginCredentialsDto): Promise<LoginTokenResult> {
    return this.loginService.login(dto);
  }
}
