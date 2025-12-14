import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MqttModuleOptions } from './interface';
import { MqttBrokerService,MqttBrokerDiscoveryService  } from './service';
import { MQTT_BROKER_MODULE_OPTIONS_CONSTANT } from './constant';
import { DynamicModuleOptions } from './type';

@Module({
})
export class MqttBrokerModule {
  static forRoot(options: DynamicModuleOptions<MqttModuleOptions>): DynamicModule {
    return {
      module: MqttBrokerModule,
      imports: [DiscoveryModule],
      providers: [
      {
          provide: MQTT_BROKER_MODULE_OPTIONS_CONSTANT,
          useFactory: options.useFactory,
          inject: options.inject || [],
          ...('useValue' in options ? { useValue: options.useValue } : {}),
          ...('useClass' in options ? { useClass: options.useClass } : {}),
        },
        MqttBrokerDiscoveryService,
        MqttBrokerService
      ],
      exports: [],
    };
  }

  static forRootAsync(options: DynamicModuleOptions<MqttModuleOptions>): DynamicModule {
    return {
      module: MqttBrokerModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: MQTT_BROKER_MODULE_OPTIONS_CONSTANT,
          useFactory: options.useFactory,
          inject: options.inject || [],
          ...('useValue' in options ? { useValue: options.useValue } : {}),
          ...('useClass' in options ? { useClass: options.useClass } : {}),
        },
        MqttBrokerDiscoveryService,
        MqttBrokerService
      ],
      exports: [],
    };
  }
}