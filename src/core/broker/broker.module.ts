import { Module } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { ConfigService } from '@nestjs/config';
import {MqttBrokerModule} from "@codewithamitpatil/amy-broker";

@Module({
  imports: [
    MqttBrokerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        broker: {
          port: configService.get('brokers.aedes.port'),
          host: configService.get('brokers.aedes.host'),
          logs:false,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BrokerService],
  exports: [BrokerService],
})
export class BrokerModule {}
