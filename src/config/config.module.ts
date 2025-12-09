import { Global, Module } from '@nestjs/common';
import { ConfigModule as CnfModule } from '@nestjs/config';
import config from './index';

@Global()
@Module({
  imports: [
    CnfModule.forRoot({
      isGlobal: true,
      validate: config,
    }),
  ],
})
export class ConfigModule {}
