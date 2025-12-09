import { Global, Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { RMQModule } from './rmq/rmq.module';
import { CompressionModule } from './compression/compression.module';

@Global()
@Module({
  imports: [RedisModule, CompressionModule, RMQModule],
  exports: [RedisModule, CompressionModule, RMQModule],
})
export class CommonModule {}
