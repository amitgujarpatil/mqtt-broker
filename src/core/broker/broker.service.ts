import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RMQPublisherSvc } from 'src/common/rmq/decorator/rmq.services.decorator';
import { RMQPublisherService } from 'src/common/rmq/service/rmq.publisher.service';
import { ConfigVariablesType } from 'src/config';

@Injectable()
export class BrokerService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService<ConfigVariablesType>,
    @RMQPublisherSvc()
    private readonly rmqPublisherService: RMQPublisherService,
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
