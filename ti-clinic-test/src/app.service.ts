import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'TI Clinic API is running. Open /api for Swagger UI.';
  }
}
