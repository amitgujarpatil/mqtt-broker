import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MqttClientService } from './mqtt.client.service';
import { MQTT_BROKER_HOOKS_METADATA_CONSTANT } from '../constant';
import { MqttSubscriberMetadata } from '../decorator/mqtt.subscribe.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MqttBrokerService } from './mqtt.broker.service';


@Injectable()
export class MqttClientDiscoveryService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    // private readonly mqttClient: MqttClientService,
    private readonly eventEmitter: EventEmitter2,
    private readonly brokerService: MqttBrokerService,
  ) {}

  onModuleInit() {
    //this.explore();
  }

  // private explore() {
  //   const providers = this.discoveryService.getProviders();
  //   const controllers = this.discoveryService.getControllers();
    
  //   [...providers, ...controllers]
  //     .filter((wrapper) => wrapper.instance)
  //     .forEach((wrapper: InstanceWrapper) => {
  //       const { instance } = wrapper;
  //       const prototype = Object.getPrototypeOf(instance);

  //       this.metadataScanner.scanFromPrototype(
  //         instance,
  //         prototype,
  //         (methodName: string) => this.registerMqttSubscriber(instance, methodName),
  //       );
  //     });
  // }

  // private registerMqttSubscriber(instance: any, methodName: string) {
  //   const metadata: MqttSubscriberMetadata = this.reflector.get(
  //     MQTT_SUBSCRIBER_AUTH_HANDLER_METADATA_CONSTANT,
  //     instance[methodName],
  //   );

  //   if (!metadata) {
  //     return;
  //   }

  //   const { topic, qos } = metadata;

  //   // Subscribe using event emitter pattern
  //   this.eventEmitter.on(`mqtt.message.${topic}`, async (data: { topic: string; payload: Buffer }) => {
  //     try {
  //       await instance[methodName](data.payload, data.topic);
  //     } catch (err) {
  //       console.error(`Error in MQTT subscriber ${methodName}:`, err);
  //     }
  //   });

  //   // Also subscribe via client
  //   if (this.mqttClient.isConnected()) {
  //     this.mqttClient.subscribe(topic, async (payload, receivedTopic) => {
  //       try {
  //         await instance[methodName](payload, receivedTopic);
  //       } catch (err) {
  //         console.error(`Error in MQTT subscriber ${methodName}:`, err);
  //       }
  //     }, { qos });
  //   }
  // }
}