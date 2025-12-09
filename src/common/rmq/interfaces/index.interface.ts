import {
  Options as amqpOptions,
  ConfirmChannel,
  MessageFields,
  ConsumeMessage as RMQConsumeMessage,
} from 'amqplib';
import { RmqQueueEnumType } from '../enum/rmq.queue.enum';

export interface ISetupExchangesAndQueuesConfig {
  createExchanges: boolean;
  createQueues: boolean;
  createBindings: boolean;
  exchanges: Array<{
    name: string;
    type: 'fanout' | 'direct' | 'topic' | 'headers';
    options?: amqpOptions.AssertExchange;
  }>;
  queues: Array<{
    name: string;
    options?: amqpOptions.AssertQueue;
  }>;
  bindings: Array<{
    queue: string;
    exchange: string;
    routingKey?: string;
  }>;
}

export interface IPublishOptions extends amqpOptions.Publish {
  compress?: boolean;
  compressionLevel?: number;
  compressionAlgorithm?: 'gzip' | 'deflate';
}

export interface RMQConsumerHandler {
  queue: RmqQueueEnumType;
  handler: (
    message: Record<string, any>,
    rawMessage: RMQConsumeMessage,
    channel: ConfirmChannel,
    fields: MessageFields,
  ) => Promise<Boolean | void>;
  prefetch?: number;
  autoCommit?: boolean;
}

export interface IRMQListerners {
  [queue: string]: {
    queue: RmqQueueEnumType;
    prefetch?: number;
    autoCommit?: boolean;
    handlers: Array<RMQConsumerHandler['handler']>;
  };
}

export interface RMQConsumerOptions {
  queue: RmqQueueEnumType;
  prefetch?: number;
  autoCommit?: boolean;
  priority?: number;
}
