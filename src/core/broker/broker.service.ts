import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RMQPublisherService } from 'src/common/rmq/decorators/rmq.services.decorator';

import { ConfigVariablesType } from 'src/config';

@Injectable()
export class BrokerService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService<ConfigVariablesType>,
    //  @RMQPublisherService() private readonly rmqPublisher: any,
  ) {
    configService.get('app');
  }

  async onModuleInit() {
    console.log('hello broker service');

    /// redis connection
    // every should have unique uuid
    // uuid against server instance
    //
  }
}
