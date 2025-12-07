import { Global, Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { RedisModule } from './redis/redis.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { CompressionModule } from './compression/compression.module';

@Global()
@Module({
  imports: [ConfigModule, RedisModule, CompressionModule, RabbitMQModule],
  exports: [ConfigModule, RedisModule, CompressionModule, RabbitMQModule],
})
export class CommonModule {}
