import { Module } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { ConfigService } from '@nestjs/config';
import { MqttBrokerModule } from 'src/common/mqtt';

@Module({
  imports: [
    MqttBrokerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        broker: {
          port: configService.get('brokers.aedes.port'),
          host: configService.get('brokers.aedes.host'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BrokerService],
  exports: [BrokerService],
})
export class BrokerModule {}
