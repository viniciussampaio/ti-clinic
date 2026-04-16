import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { Login } from './entities/login.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtExpiresInSecondsFromEnv } from './utils/jwt-expires';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Login]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: jwtExpiresInSecondsFromEnv(
            config.get<string>('JWT_EXPIRES_IN'),
          ),
        },
      }),
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy, JwtAuthGuard],
  exports: [LoginService, JwtModule, JwtAuthGuard],
})
export class LoginModule {}
