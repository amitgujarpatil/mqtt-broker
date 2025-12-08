import { OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import { Channel, Options as amqpOptions } from 'amqplib';
import { ConfigVariablesType } from 'src/config';
import { retrySafe } from '../../utils';
import { createPool, Pool } from 'generic-pool';
import { PublishOptions } from 'amqp-connection-manager/dist/types/ChannelWrapper';
import {
  ICreateChannelPoolOptions,
  IPublishOptions,
  ISetupExchangesAndQueuesConfig,
} from '../types/index.types';
import { IRMQConfigVariables } from 'src/config/config.types';
import { CompressionService } from 'src/common/compression/compression.service';
/**
 * AMQP-CONNECTION-MANAGER BENEFITS:
 *
 * ✅ Automatic reconnection on connection/channel failures
 * ✅ Channel wrapper with queuing (buffers messages during reconnect)
 * ✅ Built-in backoff strategies
 * ✅ Promise-based API
 * ✅ Better error handling
 * ✅ Production-ready out of the box
 *
 * ARCHITECTURE:
 * - 1 ConnectionManager (handles reconnection)
 * - 1 Publisher ChannelWrapper (buffered publishing)
 * - N Consumer ChannelWrappers (one per queue for isolation)
 */

/*
 Note:- methods like createExchange, createQueue, bindQueue
 would not throw errors after first failure due to the 
 configuration miss match with the existing setup in RabbitMQ.
 So we add retry logic around these methods to ensure they
 are created successfully during setup.

same queue can be bind to multiple exchanges
different routing keys.

Best Practises for RabbitMQ with NestJS:
  ✅ Use single connection per process
  ✅ Separate channels for publishing and consuming
  ✅ rmq can multiplex multiple channels over single connection
  ✅ Use confirm channels for publishing to ensure message delivery
*/

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 200;

export class RabbitMQService implements OnModuleInit {
  protected readonly _logger = new Logger(RabbitMQService.name);
  protected _config: IRMQConfigVariables;

  private _channelPool: Pool<ChannelWrapper>;

  constructor(
    protected readonly configService: ConfigService<ConfigVariablesType>,
    protected readonly compressionService: CompressionService,
  ) {
    this._config = configService.get<IRMQConfigVariables>('broker.rmq', {
      infer: true,
    });
  }

  async onModuleInit() {
    //await this.setupExchangesAndQueues();
  }

  private async _createConnection(connName: string) {
    const manager = await amqp.connect(this._config.connectionOptions, {
      reconnectTimeInSeconds: 10,
      heartbeatIntervalInSeconds: 30,

      /*
        // since i am using a rmq cluster with nginx 
        // single endpoint is sufficient and no need of service discovery
        // for service discovery
        findServers:()=>{

        }
        */
    });

    // Connection event handlers
    manager.on('connect', ({ url }) => {
      this._logger.log(
        `(${connName} connection): Connected to RabbitMQ at ${url}`,
      );
    });

    manager.on('connectFailed', ({ err, url }) => {
      this._logger.error(
        `(${connName} connection): Failed to connect to RabbitMQ at ${url}`,
        err,
      );
    });

    manager.on('disconnect', ({ err }) => {
      this._logger.warn(
        `(${connName} connection): Disconnected from RabbitMQ`,
        err,
      );
    });

    manager.on('blocked', ({ reason }) => {
      this._logger.warn(
        `(${connName} connection): RabbitMQ connection blocked: ${reason}`,
      );
    });

    manager.on('unblocked', () => {
      this._logger.log(
        `(${connName} connection): RabbitMQ connection unblocked`,
      );
    });

    return manager;
  }

  async createChannel(
    manager: IAmqpConnectionManager,
    options: {
      channelName: string;
      confirmChannel: boolean;
      setupFn?: (channel: Channel) => Promise<void>;
    } = { channelName: 'default-channel', confirmChannel: false },
  ) {
    const { channelName, confirmChannel, setupFn } = options;

    const channel = manager.createChannel({
      name: channelName,
      confirm: confirmChannel,
      setup:
        setupFn ||
        (async (channel: Channel) => {
          // Default setup can be empty or include common setup tasks
          this._logger.log(
            `try to reconnect to the broker for '${channelName}'`,
          );
        }),
    });

    // Channel event handlers
    channel.on('connect', () => {
      this._logger.log(`Channel '${channelName}' connected`);
    });

    channel.on('error', (err) => {
      this._logger.error(`Channel '${channelName}' error`, err);
    });

    channel.on('close', () => {
      this._logger.warn(`Channel '${channelName}' closed`);
    });

    // Wait for initial connection
    await channel.waitForConnect();
    this._logger.log(`Channel '${channelName}' is ready`);

    return channel;
  }

  async createConnection(connName: string = 'default') {
    try {
      return await this._createConnection(connName);
    } catch (error) {
      this._logger.error(
        `Failed to create RabbitMQ connection: ${connName}`,
        error,
      );
      throw error;
    }
  }

  async createExchange(
    channel: ChannelWrapper,
    options: {
      name: string;
      type: string;
      options?: amqpOptions.AssertExchange;
    },
  ) {
    try {
      await channel.assertExchange(
        options.name,
        options.type,
        options.options || {
          durable: false,
          autoDelete: false,
        },
      );
      this._logger.log(`Exchange '${options.name}' (${options.type}) created`);
    } catch (error) {
      this._logger.error(`Failed to create exchange '${options.name}':`, error);
      throw error;
    }
  }

  async createQueue(
    channel: ChannelWrapper,
    options: {
      name: string;
      options?: amqpOptions.AssertQueue;
    },
  ) {
    try {
      await channel.assertQueue(
        options.name,
        options.options || { durable: false, autoDelete: true },
      );
      this._logger.log(`Queue '${options.name}' created`);
    } catch (error) {
      this._logger.error(`Failed to create queue '${options.name}':`, error);
      throw error;
    }
  }

  async bindQueue(
    channel: ChannelWrapper,
    options: {
      queue: string;
      exchange: string;
      routingKey?: string;
    },
  ) {
    try {
      await channel.bindQueue(
        options.queue,
        options.exchange,
        options.routingKey || '',
      );
      this._logger.log(
        `Queue '${options.queue}' bound to exchange '${options.exchange}' with routing key '${options.routingKey || ''}'`,
      );
    } catch (error) {
      this._logger.error(
        `Failed to bind queue '${options.queue}' to exchange '${options.exchange}':`,
        error,
      );
      throw error;
    }
  }

  async setupExchangesAndQueues(config: ISetupExchangesAndQueuesConfig) {
    let connection: IAmqpConnectionManager;
    let channel: ChannelWrapper;
    try {
      connection = await this.createConnection('setup-connection');
      channel = await this.createChannel(connection, {
        channelName: 'setup-channel',
        confirmChannel: true,
      });

      // Setup exchanges
      if (config.createExchanges) {
        for (const exchange of config.exchanges) {
          await retrySafe(
            async () =>
              this.createExchange(channel, {
                name: exchange.name,
                type: exchange.type,
                options: exchange.options,
              }),
            {
              retries: DEFAULT_RETRY_ATTEMPTS,
              delay: DEFAULT_RETRY_DELAY_MS,
              logger: this._logger,
            },
          );
        }
      }

      // Setup queues
      if (config.createQueues) {
        for (const queue of config.queues) {
          // create queue
          await retrySafe(
            async () =>
              this.createQueue(channel, {
                name: queue.name,
                options: queue.options,
              }),
            {
              retries: DEFAULT_RETRY_ATTEMPTS,
              delay: DEFAULT_RETRY_DELAY_MS,
              logger: this._logger,
            },
          );
        }
      }

      // setup bindings
      if (config.createBindings) {
        for (const binding of config.bindings) {
          await retrySafe(
            async () =>
              this.bindQueue(channel, {
                queue: binding.queue,
                exchange: binding.exchange,
                routingKey: binding.routingKey,
              }),
            {
              retries: DEFAULT_RETRY_ATTEMPTS,
              delay: DEFAULT_RETRY_DELAY_MS,
              logger: this._logger,
            },
          );
        }
      }
    } catch (error) {
      this._logger.error('Failed to setup exchanges and queues', error);
    } finally {
      await channel.close();
      await connection.close();
    }
  }

  async createChannelPool(options?: ICreateChannelPoolOptions) {
    // default options
    const channelOptions = {
      channelName: 'channel-pool',
      confirmChannel: true,
      ...options?.channelOptions,
    };

    options = {
      min: 2,
      max: 10,
      connectionName: 'channel-pool-connection',
      ...options,
    };

    try {
      const connection = await this.createConnection(options.connectionName);
      return createPool(
        {
          create: async () => {
            return await this.createChannel(connection, {
              channelName: `${channelOptions.channelName}-${Math.random().toString(36).substring(7)}`,
              confirmChannel: channelOptions.confirmChannel,
            });
          },
          destroy: async (channel: ChannelWrapper) => {
            await channel.close();
          },
        },
        {
          max: options.max,
          min: options.min,
        },
      );
    } catch (error) {
      this._logger.error('Failed to create channel pool', error);
      throw error;
    }
  }

  protected async setupChannelPool(options: ICreateChannelPoolOptions) {
    this._channelPool = await this.createChannelPool(options);
  }

  async publishToExchange(
    exchange: string,
    routingKey: string = '',
    payload: Record<string, unknown> | string | Buffer,
    options?: IPublishOptions,
  ) {
    const channel = await this._channelPool.acquire();

    try {
      // Convert payload to buffer
      let content: Buffer;
      if (Buffer.isBuffer(payload)) {
        content = payload;
      } else if (typeof payload === 'string') {
        content = Buffer.from(payload);
      } else {
        content = Buffer.from(
          JSON.stringify({
            algorithm: options?.compressionAlgorithm || 'gzip',
            data: payload,
          }),
        );
      }

      const compressionResult = await this.compressionService.compress(
        content,
        {
          enabled: options?.compress !== false,
          level: options?.compressionLevel,
          algorithm: options?.compressionAlgorithm,
        },
      );

      // console.log('compressionResult', compressionResult);

      // decompress
      // const decompressed = await this.compressionService.decompress(
      //   compressionResult.data,
      //   {
      //     algorithm: 'gzip',
      //   },
      // );

      //console.log('decompressed', decompressed.toString());

      // Prepare message headers with compression metadata
      const headers = {
        ...(options?.headers || {}),
        compressed: compressionResult.compressed,
        ...(compressionResult.compressed && {
          compressionAlgorithm: compressionResult.algorithm,
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
        }),
      };

      const publishOptions: PublishOptions = {
        persistent: true,
        contentType: compressionResult.compressed
          ? 'application/octet-stream'
          : 'application/json',
        timestamp: Date.now(),
        ...options,
        headers,
      };

      // Publish message
      return await channel.publish(
        exchange,
        routingKey,
        compressionResult.data,
        publishOptions,
      );
    } catch (error) {
      this._logger.error(error);
      throw new Error(
        `Failed to publish message to exchange '${exchange}': ${error}`,
      );
    } finally {
      await this._channelPool.release(channel);
    }
  }

  async publishToQueue(
    queue: string,
    payload: Record<string, unknown> | string | Buffer,
    options?: PublishOptions,
  ) {
    return this.publishToExchange(queue, '', payload, options);
  }
}
