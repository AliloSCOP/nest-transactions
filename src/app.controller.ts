import { Controller, Get } from '@nestjs/common';
import { TransactionManager } from 'typeorm';

@Controller()
export class AppController {
  @Get()
  hello(@TransactionManager() manager) {
    console.log('-->', manager);
    return 'Hello';
  }
}
