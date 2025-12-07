import { Options as amqpOptions } from 'amqplib';

export type ICreateChannelPoolOptions = {
  min?: number;
  max?: number;
  connectionName?: string;
  channelOptions?: {
    channelName?: string;
    confirmChannel?: boolean;
  };
};

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
