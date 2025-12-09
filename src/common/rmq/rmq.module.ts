import { Global, Module } from '@nestjs/common';
import { RMQPublisherService } from './services/rmq.publisher.service';
import { RMQConsumerService } from './services/rmq.consumer.service';
import { CompressionModule } from '../compression/compression.module';
import { DiscoveryModule, ExternalContextCreator } from '@nestjs/core';
import { RMQDiscoveryService } from './services/rmq.discovery.service';
import { RMQ_CONSUMER_SERVICE, RMQ_PUBLISHER_SERVICE } from './constants';

@Global()
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
