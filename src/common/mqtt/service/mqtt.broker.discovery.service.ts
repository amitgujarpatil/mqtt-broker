import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MqttBrokerService } from './mqtt.broker.service';
import { MQTT_BROKER_HOOKS_METADATA_CONSTANT } from '../constant/index.constant';

@Injectable()
export class MqttBrokerDiscoveryService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly eventEmitter: EventEmitter2,
    private readonly brokerService: MqttBrokerService,
  ) {}

  async onModuleInit() {
    await this.brokerService.initializeBroker();
    this.registerBrokerHooks();
  }

  /**
   * Scan all providers & controllers for MQTT hook decorators
   */
  private registerBrokerHooks() {
    const wrappers = [
      ...this.discoveryService.getProviders(),
      ...this.discoveryService.getControllers(),
    ];

    for (const wrapper of wrappers) {
      const instance = wrapper.instance;
      if (!instance) continue;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const hookType = Reflect.getMetadata(
          MQTT_BROKER_HOOKS_METADATA_CONSTANT,
          instance,
          methodName,
        );

        if (!hookType) continue;

        const handler = instance[methodName].bind(instance);
        this.registerHook(hookType, handler);
      }
    }
  }

  /**
   * Route decorator handler functions -> broker service (aedes) binding
   */
  private registerHook(hook: string, handler: any) {
    switch (hook) {
      case 'authenticate':
        this.brokerService.setAuthenticateHandler(handler);
        break;

      case 'authorizePublish':
        this.brokerService.setAuthorizePublishHandler(handler);
        break;

      case 'authorizeSubscribe':
        this.brokerService.setAuthorizeSubscribeHandler(handler);
        break;

      case 'preConnect':
        this.brokerService.setPreConnectHandler(handler);
        break;

      case 'published':
        this.brokerService.setPublishedHandler(handler);
        break;

      default:
        console.warn(`[MQTT] Unknown broker hook: ${hook}`);
    }
  }
}
