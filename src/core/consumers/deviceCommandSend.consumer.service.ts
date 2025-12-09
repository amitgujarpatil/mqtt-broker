import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { RMQConsumer } from 'src/common/rmq/decorators/rmq.consumer.decorator';
import {
  RMQChannel,
  RMQRawMessage,
  RMQMessage,
} from 'src/common/rmq/decorators/rmq.params.decorator';
import RmqQueueEnum from 'src/common/rmq/enum/rmq.queue.enum';
import { RMQConsumerService } from 'src/common/rmq/services/rmq.consumer.service';

@Injectable()
export class DeviceCommandSendConsumerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly consumerService: RMQConsumerService,
  ) {}

  @RMQConsumer({
    queue: RmqQueueEnum.DEVICE_COMMAND_SEND,
    prefetch: 10,
    autoCommit: false,
  })
  async handleDeviceCommand(
    @RMQMessage() message: Record<string, any>,
    @RMQRawMessage() rawMessage: ConsumeMessage,
    @RMQChannel() channel: ConfirmChannel,
  ) {
    delete message.randomBytes;
    console.log('Device command 1 received:', message);
    // console.log('Delivery tag:', rawMessage);

    // Process command
    await new Promise((resolve) => setTimeout(resolve, 1000));

    //  await channel.ack(rawMessage);

    // Auto-commit is enabled, so no need to ack manually
  }
}
