import { SetMetadata } from '@nestjs/common';
import { RmqQueueEnumType } from '../enum/rmq.queue.enum';

export const RMQ_CONSUMER_METADATA = 'rmq:consumer';

export interface RMQConsumerOptions {
  queue: RmqQueueEnumType;
  prefetch?: number;
  autoCommit?: boolean;
  priority?: number;
}

/**
 * RabbitMQ Consumer Decorator
 *
 * Use this decorator to mark methods as RabbitMQ message consumers
 *
 * @example
 * ```typescript
 * @RMQConsumer({
 *   queue: RmqQueueEnum.DEVICE_COMMAND_SEND,
 *   prefetch: 5,
 *   autoCommit: true,
 * })
 * async handleDeviceCommand(payload: any, message: RMQConsumeMessage) {
 *   console.log('Processing:', payload);
 * }
 * ```
 */
export function RMQConsumer(options: RMQConsumerOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Store metadata about this consumer
    SetMetadata(RMQ_CONSUMER_METADATA, options)(
      target,
      propertyKey,
      descriptor,
    );

    // Store in a global registry for the class
    if (!Reflect.hasMetadata('rmq:consumers', target.constructor)) {
      Reflect.defineMetadata('rmq:consumers', [], target.constructor);
    }

    const consumers = Reflect.getMetadata('rmq:consumers', target.constructor);
    consumers.push({
      methodName: propertyKey,
      options,
    });

    return descriptor;
  };
}
