import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { RMQConsumerService } from './rmq.consumer.service';
import {
  RMQ_CONSUMER_METADATA,
  RMQConsumerOptions,
} from '../decorators/rmq.consumer.decorator';
import { ConfirmChannel, ConsumeMessage, MessageFields } from 'amqplib';

/**
 * Service that discovers and registers RMQ consumers decorated with @RMQConsumer
 */
@Injectable()
export class RMQDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(RMQDiscoveryService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
    private readonly rmqConsumerService: RMQConsumerService,
  ) {}

  async onModuleInit() {
    await this.discoverConsumers();
  }

  private async discoverConsumers() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    const instances = [...providers, ...controllers];

    const consumers: Array<{
      instance: any;
      methodName: string;
      options: RMQConsumerOptions;
    }> = [];

    // Discover all methods decorated with @RMQConsumer
    for (const wrapper of instances) {
      const { instance } = wrapper;

      if (!instance || !Object.getPrototypeOf(instance)) {
        continue;
      }

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const options = Reflect.getMetadata(
          RMQ_CONSUMER_METADATA,
          instance,
          methodName,
        );

        if (options) {
          consumers.push({
            instance,
            methodName,
            options,
          });
        }
      }
    }

    // Register all discovered consumers
    this.logger.log(`Discovered ${consumers.length} RabbitMQ consumers`);

    const handlers = consumers.map(({ instance, methodName, options }) => {
      this.logger.log(
        `Registering consumer: ${instance.constructor.name}.${methodName} for queue '${options.queue}'`,
      );

      return {
        queue: options.queue,
        prefetch: options.prefetch,
        autoCommit: options.autoCommit,
        handler: async (
          message: ConsumeMessage,
          channel: ConfirmChannel,
          fields: MessageFields,
        ) => {
          try {
            // Call the decorated method
            const result = await instance[methodName](message, channel, fields);
            return result;
          } catch (error) {
            this.logger.error(
              `Error in consumer ${instance.constructor.name}.${methodName}:`,
              error,
            );
            throw error;
          }
        },
      };
    });

    // Subscribe to all discovered handlers
    if (handlers.length > 0) {
      await this.rmqConsumerService.subscribe(handlers);
      await this.rmqConsumerService.startConsumer();
    }
  }
}
