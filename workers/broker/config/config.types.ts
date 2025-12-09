import { ISetupExchangesAndQueuesConfig } from 'src/common/rmq/types/index.types';

export interface IRMQConfigVariables extends ISetupExchangesAndQueuesConfig {
  connectionOptions: {
    url: string;
    heartbeat?: number;
    vhost?: string;
    connectionOptions?: {
      keepAlive: boolean;
      keepAliveDelay: number;
    };
  };
}
