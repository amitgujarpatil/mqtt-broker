import { RMQ_CONSUMER_METADATA } from '../constants';
import { RMQConsumerOptions } from '../interfaces/index.interface';

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
    Reflect.defineMetadata(RMQ_CONSUMER_METADATA, options, target, propertyKey);
    return descriptor;
  };
}
