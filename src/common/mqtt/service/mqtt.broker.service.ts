import {
  Injectable,
  Logger,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import Aedes, { Client, ConnectPacket, PublishPacket } from 'aedes';
import { createServer, Server as NetServer } from 'net';
import { createServer as createTlsServer, Server as TlsServer } from 'tls';
import {
  MQTTHookType,
  MqttModuleOptions,
  MQTTEventType
} from '../interface';
import { MQTT_BROKER_MODULE_OPTIONS_CONSTANT } from '../constant';

@Injectable()
export class MqttBrokerService implements OnModuleDestroy {
  private readonly _logger = new Logger(MqttBrokerService.name);
  private aedes: Aedes;
  private server: NetServer | TlsServer;
  private isShuttingDown = false;

  constructor(
    @Inject(MQTT_BROKER_MODULE_OPTIONS_CONSTANT)
    private readonly options: MqttModuleOptions,
  ) {}


  async onModuleDestroy() {
    await this.shutdown();
  }

  async initializeBroker(): Promise<void> {
    const brokerConfig = this.options.broker || {
      port: 1883,
      ssl: false,
      maxConnections: 1000,
      keepaliveTimeout: 12000,
      concurrency: 1000,
    };

    this.aedes = new Aedes(brokerConfig.aedesOptions || {});

    // Create server (TCP or TLS)
    // with tls we need to provide certificates
    if (brokerConfig.ssl) {
      this.server = createTlsServer(
        brokerConfig.sslOptions || {},
        this.aedes.handle,
      );
    } else {
      this.server = createServer(this.aedes.handle);
    }

    if (brokerConfig.maxConnections) {
      this.server.maxConnections = brokerConfig.maxConnections;
    }

    // Start listening
    const port = brokerConfig.port;
    const host = brokerConfig.host || '0.0.0.0';

    await new Promise<void>((resolve, reject) => {
      this.server.listen(port, host, () => {
        this._logger.log(`MQTT Broker started on ${host}:${port}`);
        resolve();
      });
      this.server.on('error', reject);
    });
  }

  /**
   * Register multiple event handlers at once
   */
  registerEventHandlers(
    events: {
      event: MQTTEventType;
      callback: (...args: any[]) => void | Promise<void>;
    }[]
  ): void {
    for (const { event, callback } of events) {
       try {
        this.aedes.on(event as any, callback);
      } catch (error) {
        this._logger.error(
          `Failed to register handler for event ${event}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Register multiple hook handlers at once
   */
  registerHookHandlers(
    hooks: {
      hook: MQTTHookType;
      callback: (...args: any[]) => void | Promise<void>;
    }[]
  ): void {
    for (const { hook, callback } of hooks) {
      try {
         this.aedes[hook as any] = callback;
      } catch (error) {
        this._logger.error(
          `Failed to register handler for hook ${hook}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Set custom authentication handler
   */
  setAuthenticateHandler(
    handler: (
      client: Client,
      username: string | undefined,
      password: string | undefined,
    ) => boolean | Promise<boolean>,
  ): void {
    this.aedes.authenticate = async (client, username, password, callback) => {
      try {
        const res = await handler(client, username, password.toString());
        callback(null, !!res);
      } catch (error) {
        callback(error, false);
      }
    };
  }

  /**
   * Set custom authorization handler for publishing messages
   */
  setAuthorizePublishHandler(
    handler: (
      client: Client | null,
      packet: PublishPacket,
    ) => void | Promise<boolean>,
  ): void {
    this.aedes.authorizePublish = async (client, packet, callback) => {
      try {
        const result = await handler(client, packet);
        if (result === false) {
          return callback(new Error('Publisher not authorized'));
        }
        callback(null);
      } catch (error) {
        callback(error);
      }
    };
  }

  /**
   * Set custom authorization handler for subscribing to topics / patterns
   */
  setAuthorizeSubscribeHandler(
    handler: (client: Client, subscription: any) => boolean | Promise<boolean>,
  ): void {
    this.aedes.authorizeSubscribe = async (client, subscription, callback) => {
      try {
        const result = await handler(client, subscription);
        callback(null, subscription);
      } catch (error) {
        callback(error, subscription);
      }
    };
  }

  /**
   * Set custom pre-connect handler
   */
  setPreConnectHandler(
    handler: (
      client: Client,
      packet: ConnectPacket,
    ) => boolean | Promise<boolean>,
  ): void {
    this.aedes.preConnect = async (client, packet, callback) => {
      try {
        const result = await handler(client, packet);
        callback(null, result);
      } catch (error) {
        callback(error, false);
      }
    };
  }

  /**
   * Set custom published handler
   */
  setPublishedHandler(
    handler: (client: Client, packet: PublishPacket) => void | Promise<void>,
  ): void {
    this.aedes.published = async (packet, client, callback) => {
      try {
        await handler(client, packet);
        callback();
      } catch (error) {
        callback(error);
      }
    };
  }

  /**
   * Check if broker is ready
   */
  isReady(): boolean {
    return !this.isShuttingDown;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this._logger.log('Starting graceful shutdown...');
    this.isShuttingDown = true;

    // Close Aedes broker
    await new Promise<void>((resolve) => {
      this.aedes.close(() => {
        this._logger.log('Aedes broker closed');
        resolve();
      });
    });

    // Close server
    await new Promise<void>((resolve) => {
      this.server.close(() => {
        this._logger.log('Server closed');
        resolve();
      });
    });

    this._logger.log('Graceful shutdown completed');
  }
}

