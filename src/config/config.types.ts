import { ISetupExchangesAndQueuesConfig } from 'src/common/rmq/interface/index.interface';

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

export interface MqttBrokerConfig {
  port: number;
  enableTls: boolean;
}