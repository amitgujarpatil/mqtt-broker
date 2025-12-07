import { ConfigVariablesType } from 'src/config';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { IRMQConfigVariables } from 'src/config/config.types';
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import RmqQueueEnum, { RmqQueueEnumType } from '../enum/rmq.queue.enum';
import {
  ConfirmChannel,
  MessageFields,
  ConsumeMessage as RMQConsumeMessage,
} from 'amqplib';
import { CompressionService } from 'src/common/compression/compression.service';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';

interface IRMQSubcribeOptions {
  queue: RmqQueueEnumType;
  handler: (
    msg: RMQConsumeMessage | null,
    channel: ConfirmChannel,
    fields?: MessageFields,
  ) => Promise<void>;
  prefetch?: number;
  autoCommit?: boolean;
}

interface IRMQListernerOptions {
  [queue: string]: {
    queue: RmqQueueEnumType;
    prefetch?: number;
    autoCommit?: boolean;
    handlers: Array<IRMQSubcribeOptions['handler']>;
  };
}

const DEFAULT_PREFETCH_COUNT = 1;

@Injectable()
export class RabbitMQConsumerService
  extends RabbitMQService
  implements OnModuleInit, OnApplicationShutdown
{
  protected readonly _logger = new Logger(RabbitMQConsumerService.name);
  private _consumerChannels: Map<string, ChannelWrapper> = new Map();
  private _connection: IAmqpConnectionManager;
  private _listeners: IRMQListernerOptions = {};

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

    this.subcribe([
      {
        queue: RmqQueueEnum.DEVICE_COMMAND_SEND,
        autoCommit: false,
        prefetch: 1,
        handler: async (msg, channel, routingKey) => {
          console.log(msg);
          //  console.log(msg, routingKey);
          //   const content = msg.content.toString();
          //   this._logger.log(`Received message: ${content}`);
          //   channel.ack(msg);
        },
      },
    ]);

    await this.startConsumer();
  }

  subcribe(options: Array<IRMQSubcribeOptions>) {
    options.forEach(({ queue, handler, prefetch, autoCommit }) => {
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

  private async _onMessage(
    queue: RmqQueueEnumType,
    msg: RMQConsumeMessage | null | any,
    channel: ConfirmChannel,
    fields?: MessageFields,
  ): Promise<void> {
    if (msg) {
      const callbacks = this._listeners[queue]['handlers'] || [];
      const promises = callbacks.map((handler) =>
        handler(msg, channel, fields),
      );
      await Promise.all(promises);
    }
  }

  private async _decompressMessage(msg: RMQConsumeMessage) {
    const isCompressed = msg.properties.headers?.compressed === true;
    console.log('isCompressed', isCompressed, msg);
    if (isCompressed) {
      const algorithm = msg.properties.headers?.compressionAlgorithm;
      return this.compressionService.decompress(msg.content, { algorithm });
    }
    return msg.content.toString();
  }

  async startConsumer() {
    const channelPromises = Object.entries(this._listeners).map(
      async ([key, listener]) => {
        const channel = await this.createChannel(this._connection, {
          channelName: `consumer-channel-${listener.queue}`,
          confirmChannel: true,
          setupFn: async (chan: ConfirmChannel) => {
            chan.prefetch(listener.prefetch || DEFAULT_PREFETCH_COUNT);

            await chan.consume(listener.queue, async (message) => {
              if (message) {
                try {
                  // decompress message if needed cause while publishing we might have compressed it
                  const decompressedContent =
                    await this._decompressMessage(message);
                  console.log('decompressedContent', decompressedContent);

                  // process the message
                  await this._onMessage(
                    listener.queue,
                    decompressedContent,
                    chan,
                    message.fields,
                  );

                  // Acknowledge the message if autoCommit is on
                  if (listener.autoCommit !== false) {
                    chan.ack(message);
                  }
                } catch (error) {
                  this._logger.error(
                    `Error processing message from ${listener.queue}: ${error}`,
                  );
                  if (listener.autoCommit !== false) {
                    chan.nack(message, false, false);
                  }
                }
              }
            });
          },
        });

        this._consumerChannels.set(listener.queue, channel);
      },
    );

    await Promise.all(channelPromises);
  }

  async onApplicationShutdown(signal?: string) {
    this._logger.log(
      `RabbitMQConsumerService shutting down on signal: ${signal}`,
    );
    try {
      const closeChannelPromises = Array.from(
        this._consumerChannels.values(),
      ).map(async (channel) => {
        await channel.close();
      });

      await Promise.all(closeChannelPromises);
      await this._connection.close();
    } catch (error) {
      this._logger.error(
        `Error shutting down RabbitMQConsumerService: ${error}`,
      );
    }
  }
}
