import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { RMQConsumer } from 'src/common/rmq/decorators/rmq.consumer.decorator';
import {
  RMQChannel,
  RMQMessage,
  RMQPayload,
} from 'src/common/rmq/decorators/rmq.payload.decorator';
import RmqQueueEnum from 'src/common/rmq/enum/rmq.queue.enum';
import { RMQConsumerService } from 'src/common/rmq/services/rmq.consumer.service';

@Injectable()
export class DeviceCommandSendConsumerService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly consumerService: RMQConsumerService,
  ) {}

  async onModuleInit() {
    // this.consumerService.subscribe([
    //   {
    //     queue: RmqQueueEnum.DEVICE_COMMAND_SEND,
    //     autoCommit: true,
    //     prefetch: 1,
    //     handler: async (msg, channel, fields) => {
    //       console.log('Payload:', msg);
    //       console.log('Routing Key:', fields);
    //       // Acknowledge the message
    //       // channel.ack(msg);
    //       // deleay for testing nack
    //       await new Promise((resolve) => setTimeout(resolve, 2000));
    //       return true;
    //     },
    //   },
    // ]);
    // await this.consumerService.startConsumer();
  }

  @RMQConsumer({
    queue: RmqQueueEnum.DEVICE_COMMAND_SEND,
    prefetch: 1,
    autoCommit: false,
  })
  async handleDeviceCommand(
    @RMQPayload() payload: any,
    @RMQMessage() message: ConsumeMessage,
    @RMQChannel() channel: ConfirmChannel,
  ) {
    console.log('Device command received:', payload);
    console.log('Delivery tag:', message.fields.deliveryTag);

    // Process command
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Auto-commit is enabled, so no need to ack manually
  }
}
