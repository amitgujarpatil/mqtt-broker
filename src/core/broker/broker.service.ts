import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigVariablesType } from 'src/config';

@Injectable()
export class BrokerService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService<ConfigVariablesType>,
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
