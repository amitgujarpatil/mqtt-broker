import {  Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MqttBrokerModule } from './mqtt.broker.module';

@Module({
  imports: [
    MqttBrokerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        broker: {
          port: configService.get('brokers.aedes.port'),
          host: configService.get('MQTT_HOST'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MqttModule {}
