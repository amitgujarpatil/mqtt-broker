import { DynamicModule, Inject, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { MqttModuleOptions } from './interface/index.interface';
import { MqttBrokerService } from './service/mqtt.broker.service';
import { MqttClientService } from './service/mqtt.client.service';
import { MqttBrokerDiscoveryService } from './service/mqtt.broker.discovery.service';
import { MQTT_BROKER_MODULE_OPTIONS_CONSTANT, MQTT_CLIENT_MODULE_OPTIONS_CONSTANT } from './constant/index.constant';
import { DynamicModuleOptions } from './type/index.type';

@Module({
})
export class MqttBrokerModule {
  static forRoot(options: DynamicModuleOptions<MqttModuleOptions>): DynamicModule {
    return {
      module: MqttBrokerModule,
      imports: [DiscoveryModule, EventEmitterModule.forRoot()],
      providers: [
      {
          provide: MQTT_BROKER_MODULE_OPTIONS_CONSTANT,
          useFactory: options.useFactory,
          inject: options.inject || [],
          ...('useValue' in options ? { useValue: options.useValue } : {}),
          ...('useClass' in options ? { useClass: options.useClass } : {}),
        },
        // {
        //   provide: MqttBrokerService,
        //   useFactory: (options) => new MqttBrokerService(options),
        //   inject: [MQTT_BROKER_MODULE_OPTIONS_CONSTANT],
        // },
        // {
        //   provide: MqttClientService,
        //   useFactory: (eventEmitter: EventEmitter2) => {
        //     return new MqttClientService();
        //     //  return new MqttClientService(options, eventEmitter);
        //   },
        //   inject: [EventEmitter2],
        // },
        MqttBrokerDiscoveryService,
        MqttBrokerService
      ],
      exports: [MqttBrokerService],
    };
  }

  static forRootAsync(options: DynamicModuleOptions<MqttModuleOptions>): DynamicModule {
    return {
      module: MqttBrokerModule,
      imports: [DiscoveryModule, EventEmitterModule.forRoot()],
      providers: [
        {
          provide: MQTT_BROKER_MODULE_OPTIONS_CONSTANT,
          useFactory: options.useFactory,
          inject: options.inject || [],
          ...('useValue' in options ? { useValue: options.useValue } : {}),
          ...('useClass' in options ? { useClass: options.useClass } : {}),
        },
        // {
        //   provide: MqttBrokerService,
        //   useFactory: (opts: MqttModuleOptions) => new MqttBrokerService(opts),
        //   inject: [MQTT_BROKER_MODULE_OPTIONS_CONSTANT],
        // },
        // {
        //   provide: MqttClientService,
        //   useFactory: (
        //     opts: MqttModuleOptions,
        //     eventEmitter: EventEmitter2,
        //   ) => {
        //     return new MqttClientService();
        //     // return new MqttClientService(opts, eventEmitter);
        //   },
        //   inject: [MQTT_CLIENT_MODULE_OPTIONS_CONSTANT, EventEmitter2],
        // },
        MqttBrokerDiscoveryService,
        MqttBrokerService
      ],
      exports: [MqttBrokerService],
    };
  }
}
