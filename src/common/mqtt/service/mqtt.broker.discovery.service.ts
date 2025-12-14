import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { MqttBrokerService } from './mqtt.broker.service';
import { MQTT_BROKER_EVENTS_METADATA_CONSTANT, MQTT_BROKER_HOOKS_METADATA_CONSTANT } from '../constant';
import { EVENT_WRAPPERS } from '../util';
import { MQTTEventHandler, MQTTHookHandler } from '../interface';

@Injectable()
export class MqttBrokerDiscoveryService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly brokerService: MqttBrokerService,
  ) {}

  async onModuleInit() {
    await this.brokerService.initializeBroker();
    this.registerBrokerHooksAndEvents();
  }
  
  /**
   * Scan all providers & controllers for MQTT hook and event decorators
   */
  private registerBrokerHooksAndEvents() {
    const wrappers = [
      ...this.discoveryService.getProviders(),
      ...this.discoveryService.getControllers(),
    ];

    const event_handlers: MQTTEventHandler[] = [];
    const hook_handlers: MQTTHookHandler[] = [];

    for (const { instance } of wrappers) {
      if (!instance) continue;

      const prototype = Object.getPrototypeOf(instance);
      const method_names = this.metadataScanner.getAllMethodNames(prototype);

      for (const method_name of method_names) {
        const hook_type = Reflect.getMetadata(
          MQTT_BROKER_HOOKS_METADATA_CONSTANT,
          instance,
          method_name,
        );

        if (hook_type) {
          // need to bind the method to the instance,  so method can access "this"
          const handler = instance[method_name].bind(instance);
          hook_handlers.push({ hook: hook_type, callback: handler });
        }

        const event_type = Reflect.getMetadata(
          MQTT_BROKER_EVENTS_METADATA_CONSTANT,
          instance,
          method_name,
        );

        if (event_type) {
          // need to bind the method to the instance,  so method can access "this"
          const handler = instance[method_name].bind(instance);
          // wrapp the handler to aedes expected signature
          const event_wrapper = EVENT_WRAPPERS[event_type];
          if (event_wrapper) {
            event_handlers.push({ event: event_type, callback: event_wrapper(handler) });
          }
        }
      }
    }

    this.brokerService.registerEventHandlers(event_handlers);
    this.brokerService.registerHookHandlers(hook_handlers);
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
