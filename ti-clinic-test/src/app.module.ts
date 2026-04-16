import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClinicModule } from './clinic/clinic.module';
import { LoginModule } from './login/login.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'clinic'),
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    LoginModule,
    ClinicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
