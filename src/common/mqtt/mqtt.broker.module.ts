import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { MqttModuleOptions } from './interface/index.interface';
import { MqttBrokerService } from './service/mqtt.broker.service';
import { MqttClientService } from './service/mqtt.client.service';
import { MqttDiscoveryService } from './service/mqtt.discovery.service';
import { MQTT_MODULE_OPTIONS } from './constant/index.constant';

@Module({
})
export class MqttBrokerModule {
  static forRoot(options: MqttModuleOptions): DynamicModule {
    return {
      module: MqttBrokerModule,
      imports: [DiscoveryModule, EventEmitterModule.forRoot()],
      providers: [
        {
          provide: MQTT_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: MqttBrokerService,
          useFactory: () => new MqttBrokerService(options),
        },
        {
          provide: MqttClientService,
          useFactory: (eventEmitter: EventEmitter2) => {
            return new MqttClientService();
            //  return new MqttClientService(options, eventEmitter);
          },
          inject: [EventEmitter2],
        },
        MqttDiscoveryService,
      ],
      exports: [MqttBrokerService, MqttClientService],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<MqttModuleOptions> | MqttModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: MqttBrokerModule,
      imports: [DiscoveryModule, EventEmitterModule.forRoot()],
      providers: [
        {
          provide: MQTT_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: MqttBrokerService,
          useFactory: (opts: MqttModuleOptions) => new MqttBrokerService(opts),
          inject: [MQTT_MODULE_OPTIONS],
        },
        {
          provide: MqttClientService,
          useFactory: (
            opts: MqttModuleOptions,
            eventEmitter: EventEmitter2,
          ) => {
            return new MqttClientService();
            // return new MqttClientService(opts, eventEmitter);
          },
          inject: [MQTT_MODULE_OPTIONS, EventEmitter2],
        },
        MqttDiscoveryService,
      ],
      exports: [MqttBrokerService, MqttClientService],
    };
  }
}
