import { ConfigVariablesType } from 'src/config';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import RmqQueueEnum, { RmqQueueEnumType } from '../enum/rmq.queue.enum';
import {
  ConfirmChannel,
  MessageFields,
  ConsumeMessage as RMQConsumeMessage,
} from 'amqplib';
import { CompressionService } from 'src/common/compression/compression.service';
import { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import { IRMQListerners, RMQConsumerHandler } from '../types/index.types';

const DEFAULT_PREFETCH_COUNT = 1;

@Injectable()
export class RabbitMQConsumerService
  extends RabbitMQService
  implements OnModuleInit, OnApplicationShutdown
{
  protected readonly _logger = new Logger(RabbitMQConsumerService.name);
  private _consumerChannels: Map<string, ChannelWrapper> = new Map();
  private _connection: IAmqpConnectionManager;
  private _listeners: IRMQListerners = {};

  constructor(
    configService: ConfigService<ConfigVariablesType>,
    compressionService: CompressionService,
  ) {
    super(configService, compressionService);
  }

  async onModuleInit() {
    const connectionName = `${this.configService.get<string>('app.name', {
      infer: true,
    })}-consumer-connection`;

    this._connection = await this.createConnection(connectionName);

    this.subscribe([
      {
        queue: RmqQueueEnum.DEVICE_COMMAND_SEND,
        autoCommit: true,
        prefetch: 1,
        handler: async (msg, channel, fields) => {
          console.log('Payload:', msg);
          console.log('Routing Key:', fields);

          // Acknowledge the message
          // channel.ack(msg);
          // deleay for testing nack
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return true;
        },
      },
    ]);

    await this.startConsumer();
  }

  subscribe(handlers: Array<RMQConsumerHandler>) {
    handlers.forEach(({ queue, handler, prefetch, autoCommit }) => {
      const existing = this._listeners[queue];
      if (existing) {
        existing.handlers.push(handler);
      } else {
        this._listeners[queue] = {
          queue,
          prefetch,
          autoCommit,
          handlers: [handler],
        };
      }
    });
  }

  private async _processMessage(
    queue: RmqQueueEnumType,
    message: RMQConsumeMessage,
    channel: ConfirmChannel,
    fields: MessageFields,
  ): Promise<void> {
    if (message) {
      const handlers = this._listeners[queue]?.handlers || [];
      const handlerPromises = handlers.map((handler) =>
        handler(message, channel, fields),
      );
      await Promise.all(handlerPromises);
    }
  }

  private async _decompressMessage(message: RMQConsumeMessage) {
    let content = message.content.toString();
    try {
      const isCompressed = message.properties.headers?.compressed === true;

      if (isCompressed) {
        const algorithm = message.properties.headers?.compressionAlgorithm;
        const buffer = await this.compressionService.decompress(
          message.content,
          { algorithm },
        );
        content = buffer.toString();
      }
      return content;
    } catch (error) {
      this._logger.error('Failed to decompress message', error);
      return content;
    }
  }

  private async _shutdownConsumer() {
    this._logger.log('Shutting down RabbitMQ consumers...');

    try {
      const channelClosePromises = Array.from(
        this._consumerChannels.values(),
      ).map(async (channel) => {
        try {
          await channel.close();
        } catch (error) {
          this._logger.warn('Error closing channel during shutdown', error);
        }
      });

      await Promise.all(channelClosePromises);
      this._logger.log('RabbitMQ consumers shut down successfully');
    } catch (error) {
      this._logger.error(`Error shutting down RabbitMQ consumers: ${error}`);
    }
  }

  private _setupConsumerFunction(listener: IRMQListerners[string]) {
    return async (chan: ConfirmChannel) => {
      chan.prefetch(listener.prefetch || DEFAULT_PREFETCH_COUNT);

      await chan.consume(
        listener.queue,
        async (message) => {
          if (!message) {
            this._logger.warn(
              `Received null message from queue: ${listener.queue}`,
            );
            return;
          }

          try {
            // Decompress the message content
            const decompressedContent = await this._decompressMessage(message);

            // Parse the decompressed content
            const parsedPayload = JSON.parse(
              decompressedContent?.toString() || '{}',
            )['data'];

            // Now handlers receive the complete message with all RabbitMQ properties
            await this._processMessage(
              listener.queue,
              parsedPayload,
              chan,
              message.fields,
            );

            // Acknowledge the message if autoCommit is enabled
            if (listener.autoCommit !== false) {
              chan.ack(message);
            }
          } catch (error) {
            this._logger.error(
              `Error processing message from ${listener.queue}: ${error.message}`,
              error.stack,
            );

            // Reject message if autoCommit is enabled
            if (listener.autoCommit !== false) {
              // Don't requeue (false) - will go to DLQ if configured
              chan.nack(message, false, false);
            }
          }
        },
        {
          noAck: !(listener.autoCommit === true),
          consumerTag: `${listener.queue}-consumer-${Date.now()}`,
        },
      );

      this._logger.log(
        `Consumer started for queue '${listener.queue}' with prefetch: ${listener.prefetch || DEFAULT_PREFETCH_COUNT}`,
      );
    };
  }

  async startConsumer() {
    const channelPromises = Object.entries(this._listeners).map(
      async ([queueName, listener]) => {
        const channel = await this.createChannel(this._connection, {
          channelName: `consumer-channel-${queueName}`,
          confirmChannel: true,
          setupFn: this._setupConsumerFunction(listener),
        });

        // Store channel reference for shutdown
        this._consumerChannels.set(queueName, channel);
      },
    );

    await Promise.all(channelPromises);
    this._logger.log('All consumers started successfully');
  }

  async onApplicationShutdown(signal?: string) {
    await this._shutdownConsumer();
  }
}
