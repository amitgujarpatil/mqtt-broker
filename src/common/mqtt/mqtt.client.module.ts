import { DynamicModule, Module } from '@nestjs/common';
import { MqttClientService } from './service/mqtt.client.service';
import { MqttClientDiscoveryService } from './service/mqtt.client.discovery.service';
import { MQTTClientModuleOptions } from './interface/index.interface';
import { MQTT_CLIENT_MODULE_OPTIONS_CONSTANT } from './constant/index.constant';
import { DynamicModuleOptions } from './type/index.type';

@Module({})
export class MqttClientModule {
  static forRootAsync(
    options: DynamicModuleOptions<MQTTClientModuleOptions>,
  ): DynamicModule {
    return {
      module: MqttClientModule,
      imports: [],
      providers: [
        MqttClientService,
        MqttClientDiscoveryService,
        {
          provide: MQTT_CLIENT_MODULE_OPTIONS_CONSTANT,
          useFactory: options.useFactory,
          useValue: options.useValue,
          inject: options.inject || [],
        },
      ],
      exports: [MqttClientService],
    };
  }
}
