import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceHealthCheck(): Record<string, unknown> {
    return {
      health: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
