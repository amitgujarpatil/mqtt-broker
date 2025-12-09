import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RMQPublisherService } from './common/rmq/services/rmq.publisher.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private readonly rmqPublisherService: RMQPublisherService,
  ) {}

  async onModuleInit() {
    // You can add initialization logic here if needed
    console.log('AppService initialized');
  }
  getHello(): string {
    return 'Hello World!';
  }
}
