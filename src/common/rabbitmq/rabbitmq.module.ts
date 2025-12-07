import { Module } from '@nestjs/common';
import { RabbitMQPublisherService } from './services/rabbitmq.publisher.service';
import { RabbitMQConsumerService } from './services/rabbitmq.consumer.service';
import { CompressionModule } from '../compression/compression.module';

@Module({
  imports: [CompressionModule],
  exports: [RabbitMQPublisherService, RabbitMQConsumerService],
  providers: [RabbitMQPublisherService, RabbitMQConsumerService],
})
export class RabbitMQModule {}
