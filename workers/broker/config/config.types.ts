import { ISetupExchangesAndQueuesConfig } from 'src/common/rmq/interfaces/index.interface';

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
