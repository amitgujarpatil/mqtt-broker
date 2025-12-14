import { Module } from '@nestjs/common';
import { RMQPublisherService } from './service/rmq.publisher.service';
import { RMQConsumerService } from './service/rmq.consumer.service';
import { CompressionModule } from '../compression/compression.module';
import { DiscoveryModule, ExternalContextCreator } from '@nestjs/core';
import { RMQDiscoveryService } from './service/rmq.discovery.service';
import { RMQ_CONSUMER_SERVICE, RMQ_PUBLISHER_SERVICE } from './constant';

@Module({
  imports: [CompressionModule, DiscoveryModule],
  exports: [
    RMQPublisherService,
    RMQConsumerService,
    RMQ_PUBLISHER_SERVICE,
    RMQ_CONSUMER_SERVICE,
  ],
  providers: [
    ExternalContextCreator,
    RMQPublisherService,
    RMQConsumerService,
    RMQDiscoveryService,
    {
      provide: RMQ_PUBLISHER_SERVICE,
      useExisting: RMQPublisherService,
    },
    {
      provide: RMQ_CONSUMER_SERVICE,
      useExisting: RMQConsumerService,
    },
  ],
})
export class RMQModule {}
