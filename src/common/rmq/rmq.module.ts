import { Global, Module } from '@nestjs/common';
import { RMQPublisherService } from './services/rmq.publisher.service';
import { RMQConsumerService } from './services/rmq.consumer.service';
import { CompressionModule } from '../compression/compression.module';
import { DiscoveryModule } from '@nestjs/core';
import { RMQDiscoveryService } from './services/rmq.discovery.service';

@Module({
  imports: [CompressionModule, DiscoveryModule],
  exports: [RMQPublisherService, RMQConsumerService],
  providers: [RMQPublisherService, RMQConsumerService, RMQDiscoveryService],
})
export class RMQModule {}
