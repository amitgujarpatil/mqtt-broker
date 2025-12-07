import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { ConfigVariablesType } from 'src/config';
import RmqQueueEnum from '../enum/rmq.queue.enum';
import { PublishOptions } from 'amqp-connection-manager/dist/types/ChannelWrapper';
import RmqRoutingKeyEnum from '../enum/rmq.routing.key.enum';
import RmqExchangeEnum from '../enum/rmq.exchange.enum';
import { IRMQConfigVariables } from 'src/config/config.types';
import { CompressionService } from 'src/common/compression/compression.service';
import { IPublishOptions } from '../types/index.types';
import { randomBytes } from 'crypto';

@Injectable()
export class RabbitMQPublisherService
  extends RabbitMQService
  implements OnModuleInit
{
  protected readonly _logger = new Logger(RabbitMQPublisherService.name);
  private _cfg: IRMQConfigVariables;

  constructor(
    configService: ConfigService<ConfigVariablesType>,
    compressionService: CompressionService,
  ) {
    super(configService, compressionService);
    this._cfg = configService.get<IRMQConfigVariables>('broker.rmq', {
      infer: true,
    });
  }

  async onModuleInit() {
    // setup channel pool for publisher
    await this.setupChannelPool({
      min: 3,
      max: 10,
      connectionName: 'publisher-channel-pool',
      channelOptions: {
        channelName: 'publisher-channel',
        confirmChannel: true,
      },
    });

    // setup exchanges and queues
    await this.setupExchangesAndQueues(this._cfg);

    await this.testPublishMessage();
  }

  async testPublishMessage() {
    let num = 0;
    const publishMessage = async () => {
      const msg = `Test message ${num++} at ${new Date().toISOString()}`;
      await this.publishToMessageReceiveQueue(msg, {
        persistent: true,
      });
      this._logger.log(`Message published to device.message.receive: ${msg}`);
    };
    // setInterval(publishMessage, 1000);

    let num2 = 0;
    const publishDeviceCommand = async () => {
      const deviceId = num2++ % 2 == 0 ? 1 : 2;
      const cmd = {
        command: 'reboot',
        timestamp: new Date().toISOString(),
        deviceId: `device-${deviceId}`,
        randomBytes: randomBytes(2020).toString('hex'),
      };
      const routingKey = `${process.env.NODE_ENV}.device.command.send.id.broker-${deviceId}`;

      await this.publishToDeviceCommandSendExchange(routingKey, cmd, {
        persistent: true,
        compress: true,
        compressionAlgorithm: 'gzip',
        compressionLevel: 6,
      });
      this._logger.log(`Command published to device.command.send: ${cmd}`);
    };
   // setInterval(publishDeviceCommand, 1000);
  }

  async publishToMessageReceiveQueue(
    content: Record<string, unknown> | string,
    options?: IPublishOptions,
  ) {
    return this.publishToExchange(
      RmqQueueEnum.DEVICE_MESSAGE_RECEIVE,
      RmqRoutingKeyEnum.DEVICE_MESSAGE_RECEIVE,
      content,
      options,
    );
  }

  async publishToHandshakeQueue(
    content: Record<string, unknown> | string,
    options?: IPublishOptions,
  ) {
    return this.publishToExchange(
      RmqQueueEnum.DEVICE_HANDSHAKE,
      RmqRoutingKeyEnum.DEVICE_HANDSHAKE,
      content,
      options,
    );
  }

  async publishToDeviceCommandSendExchange(
    routingKey: string,
    payload: Record<string, unknown> | string,
    options?: IPublishOptions,
  ) {
    return this.publishToExchange(
      RmqExchangeEnum.DEVICE_COMMAND_SEND,
      routingKey,
      payload,
      options,
    );
  }
}
