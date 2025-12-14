import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { RMQConsumerService } from './rmq.consumer.service';
import {
  RMQ_CONSUMER_METADATA,
  RMQ_PUBLISHER_SERVICE,
  RMQ_PUBLISHER_SERVICE_METADATA,
} from '../constant';
import { RMQParamType } from '../enum/rmq.params.enum';
import { RMQ_PARAM_METADATA } from '../constant';
import { RMQConsumerHandler } from '../interface/index.interface';
import { RMQPublisherService } from './rmq.publisher.service';
import { IRMQConfigVariables } from 'workers/broker/config/config.types';
import { ConfigVariablesType } from 'workers/broker/config';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class RMQDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(RMQDiscoveryService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly rmqConsumerService: RMQConsumerService,
    private readonly rmqPublisherService: RMQPublisherService,
    private readonly configService: ConfigService<ConfigVariablesType>,
  ) {}

  async onModuleInit() {
    if (process.env.ENABLE_RMQ_BROKER !== 'true') {
      this.logger.log(
        'RMQ Broker is disabled via ENABLE_RMQ_BROKER env variable.',
      );
      return;
    }

    await this.rmqConsumerService.setupExchangesAndQueues(
      this.configService.get<IRMQConfigVariables>('broker.rmq', {
        infer: true,
      }),
    );
    await this.discoverConsumers();
    await this.discoverPublishers();
  }

  /*
    * Discover and register RMQ consumers
    flow:
    - Scan all providers and controllers for methods with RMQ_CONSUMER_METADATA
    - For each discovered method, extract metadata and create a handler
    - Register handlers with RMQConsumerService

    - While registering handlers, mapping method parameters using RMQ_PARAM_METADATA
      that I have setup in parameter decorators
    - Create a consumer instance for each handler
    - pass args to the method based on parameter types
    - Start the consumer service
  */
  async discoverConsumers() {
    const instances = [
      ...this.discoveryService.getProviders(),
      ...this.discoveryService.getControllers(),
    ];

    const consumers = [];

    for (const { instance } of instances) {
      if (!instance) continue;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const options = Reflect.getMetadata(
          RMQ_CONSUMER_METADATA,
          instance,
          methodName,
        );
        if (!options) continue;

        consumers.push({ instance, methodName, options });
      }
    }

    if (consumers.length === 0) return;

    await this.rmqConsumerService.init();

    const handlers = consumers.map(
      ({ instance, methodName, options }) =>
        ({
          queue: options.queue,
          prefetch: options.prefetch,
          autoCommit: options.autoCommit,
          handler: async (message, rawMessage, channel, fields) => {
            try {
              const metadata: { index: number; type: string; data?: any }[] =
                Reflect.getMetadata(RMQ_PARAM_METADATA, instance[methodName]) ||
                [];

              const args: any[] = [];

              for (const param of metadata) {
                switch (param.type) {
                  case RMQParamType.MESSAGE:
                    args[param.index] = param.data
                      ? message?.[param.data]
                      : message;
                    break;

                  case RMQParamType.RAW_MESSAGE:
                    args[param.index] = rawMessage;
                    break;

                  case RMQParamType.CHANNEL:
                    args[param.index] = channel;
                    break;

                  case RMQParamType.FIELDS:
                    args[param.index] = param.data
                      ? fields?.[param.data]
                      : fields;
                    break;

                  case RMQParamType.HEADERS:
                    args[param.index] = param.data
                      ? rawMessage?.properties?.headers?.[param.data]
                      : rawMessage?.properties?.headers;
                    break;
                }
              }

              // Fill any missing args
              // to match exact number of method parameters
              args.length = instance[methodName].length;

              return await instance[methodName](...args);
            } catch (err) {
              this.logger.error(
                `Consumer Error ${instance.constructor.name}.${methodName}`,
                err,
              );
              throw err;
            }
          },
        }) as RMQConsumerHandler,
    );

    await this.rmqConsumerService.subscribe(handlers);
    await this.rmqConsumerService.startConsumer();
  }

  async discoverPublishers() {
    const instances = [
      ...this.discoveryService.getProviders(),
      ...this.discoveryService.getControllers(),
    ];

    let publisherUsed = false;

    for (const { instance } of instances) {
      if (!instance) continue;

      const hasPublisherMeta = Reflect.getMetadata(
        RMQ_PUBLISHER_SERVICE_METADATA,
        instance.constructor,
      );

      if (hasPublisherMeta) {
        publisherUsed = true;
        break;
      }
    }

    if (!publisherUsed) {
      this.logger.log(
        'No @RMQPublisherService() usage found — skipping publisher init',
      );
      return;
    }

    this.logger.log(
      'Publisher needed — initializing RMQ publisher connection...',
    );
    await this.rmqPublisherService.init();
    this.logger.log('Publisher ready ✓');
  }
}
