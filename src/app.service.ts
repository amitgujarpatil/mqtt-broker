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
    // You can use the RMQPublisherService here if needed
    await this.rmqPublisherService.testPublishMessage();

    // try {
    //   console.log('AppService initialized successfully.');
    // } catch (error) {
    //   console.error('Error during AppService initialization:', error);
    // }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
