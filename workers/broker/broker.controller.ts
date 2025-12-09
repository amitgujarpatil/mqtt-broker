import { Controller, Get } from '@nestjs/common';

@Controller()
export class BrokerController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'hello from broker worker';
  }
}
