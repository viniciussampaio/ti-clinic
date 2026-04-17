import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { RegisterLoginDto } from './dto/register-login.dto';
import { Login } from './entities/login.entity';
import type {
  LoginTokenResult,
  RegisterResult,
} from './types/auth-response.types';
import type { JwtPayload } from './types/jwt-payload.interface';
import type { ILoginService } from './login.service.interface';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class LoginService implements ILoginService {
  constructor(
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterLoginDto): Promise<RegisterResult> {
    const existing = await this.loginRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const login = this.loginRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      displayName: dto.displayName?.trim() || null,
      isActive: true,
    });
    await this.loginRepository.save(login);

    return {
      id: login.id as number,
      email: login.email as string,
      displayName: login.displayName as string | null,
    };
  }

  async login(dto: LoginCredentialsDto): Promise<LoginTokenResult> {
    const login = await this.loginRepository.findOne({
      where: { email: dto.email.toLowerCase(), isActive: true },
    });
    if (!login) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      login.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: login.id as number,
      email: login.email as string,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: login.id as number,
        email: login.email as string,
        displayName: login.displayName,
      },
    };
  }
}
