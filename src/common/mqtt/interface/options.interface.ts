import { AedesOptions } from "aedes";

export interface MqttModuleOptions {
  broker?: {
    port?: number;
    host?: string;
    ssl?: boolean;
    sslOptions?: {
      key?: Buffer;
      cert?: Buffer;
      ca?: Buffer;
      rejectUnauthorized?: boolean;
      requestCert?: boolean;
    };
    maxConnections?: number;
    keepaliveTimeout?: number;
    concurrency?: number;
    aedesOptions?:AedesOptions;
  };
  client?: {
    enabled: boolean;
    host: string;
    port: number;
    clientId?: string;
    username?: string;
    password?: string;
    reconnectPeriod?: number;
  };
}

export interface MQTTClientModuleOptions {
    enabled: boolean;
    host: string;
    port: number;
    clientId?: string;
    username?: string;
    password?: string;
    reconnectPeriod?: number;
}

export interface MqttPublishOptions {
  qos?: 0 | 1 | 2;
  retain?: boolean;
  dup?: boolean;
}
