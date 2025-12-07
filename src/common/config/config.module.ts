import { Module } from '@nestjs/common';
import { ConfigModule as CnfModule } from '@nestjs/config';
import config from '../../config/index';

@Module({
  imports: [
    CnfModule.forRoot({
      isGlobal: true,
      validate: config,
    }),
  ],
})
export class ConfigModule {}
