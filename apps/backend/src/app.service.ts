import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus() {
    return {
      status: 'ok',
      service: 'SafeBash API',
      timestamp: new Date().toISOString(),
    };
  }
}
