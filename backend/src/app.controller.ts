import { Controller, Get } from '@nestjs/common';
import { Public } from './common/guards/jwt-auth.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): Record<string, any> {
    return this.appService.getServiceHealthCheck();
  }
}
