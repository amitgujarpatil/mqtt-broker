import { ConfigVariablesType } from 'src/config';
import { RabbitMQService } from './rmq.service';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { RmqQueueEnumType } from '../enum/rmq.queue.enum';
import {
  ConfirmChannel,
  MessageFields,
  ConsumeMessage as RMQConsumeMessage,
} from 'amqplib';
import { CompressionService } from 'src/common/compression/compression.service';
import { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import {
  IRMQListerners,
  RMQConsumerHandler,
} from '../interfaces/index.interface';

const DEFAULT_PREFETCH_COUNT =
  parseInt(process.env.RMQ_PREFETCH_COUNT, 10) || 10;

@Injectable()
export class RMQConsumerService
  extends RabbitMQService
  implements OnApplicationShutdown
{
  protected readonly _logger = new Logger(RMQConsumerService.name);
  private _consumerChannels: Map<string, ChannelWrapper> = new Map();
  private _connection: IAmqpConnectionManager;
  private _listeners: IRMQListerners = {};
  private _isInitialized = false;

  constructor(
    configService: ConfigService<ConfigVariablesType>,
    compressionService: CompressionService,
  ) {
    super(configService, compressionService);
  }

  /**
   * Initialize connection (called by discovery service)
   */
  async initialize() {
    if (this._isInitialized) {
      return;
    }

    const connectionName = `${this.configService.get<string>('app.name', {
      infer: true,
    })}-consumer-connection`;

    this._connection = await this.createConnection(connectionName);
    this._isInitialized = true;

    this._logger.log('RMQ Consumer Service initialized');
  }

  /**
   * Subscribe to queues with handlers
   */
  async subscribe(handlers: Array<RMQConsumerHandler>) {
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

  private async _processMessage({
    queue,
    message,
    rawMessage,
    channel,
    fields,
  }: {
    queue: RmqQueueEnumType;
    message: Record<string, any>;
    rawMessage: RMQConsumeMessage;
    channel: ConfirmChannel;
    fields: MessageFields;
  }): Promise<void> {
    if (message) {
      const handlers = this._listeners[queue]?.handlers || [];
      const handlerPromises = handlers.map((handler) =>
        handler(message, rawMessage, channel, fields),
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

      if (this._connection) {
        await this._connection.close();
      }

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
            const decompressedContent = await this._decompressMessage(message);

            let parsedPayload: Record<string, any>;
            try {
              parsedPayload = JSON.parse(
                decompressedContent?.toString() || '{}',
              );

              if (parsedPayload.data !== undefined) {
                parsedPayload = parsedPayload.data;
              }
            } catch (parseError) {
              this._logger.error('Failed to parse message', parseError);
              parsedPayload = {};
            }

            // Process the message with all handlers
            await this._processMessage({
              queue: listener.queue,
              message: parsedPayload,
              rawMessage: message,
              channel: chan,
              fields: message?.fields,
            });

            if (listener.autoCommit !== false) {
              chan.ack(message);
            }
          } catch (error) {
            this._logger.error(
              `Error processing message from ${listener.queue}: ${error.message}`,
              error.stack,
            );

            if (listener.autoCommit !== false) {
              chan.nack(message, false, false);
            }
          }
        },
        {
          noAck: listener.autoCommit === true,
          consumerTag: `${listener.queue}-consumer-${Date.now()}`,
        },
      );

      this._logger.log(
        `Consumer started for queue '${listener.queue}' with prefetch: ${listener.prefetch || DEFAULT_PREFETCH_COUNT}`,
      );
    };
  }

  /**
   * Start consumer for all registered queues
   */
  async startConsumer() {
    if (!this._isInitialized) {
      await this.initialize();
    }

    const queueCount = Object.keys(this._listeners).length;

    if (queueCount === 0) {
      this._logger.warn('No consumers registered. Skipping startConsumer()');
      return;
    }

    this._logger.log(`Starting ${queueCount} consumer(s)...`);

    const channelPromises = Object.entries(this._listeners).map(
      async ([queueName, listener]) => {
        const channel = await this.createChannel(this._connection, {
          channelName: `consumer-channel-${queueName}`,
          confirmChannel: true,
          setupFn: this._setupConsumerFunction(listener),
        });

        this._consumerChannels.set(queueName, channel);
      },
    );

    await Promise.all(channelPromises);
    this._logger.log(`All ${queueCount} consumer(s) started successfully`);
  }

  async onApplicationShutdown(signal?: string) {
    await this._shutdownConsumer();
  }
}
