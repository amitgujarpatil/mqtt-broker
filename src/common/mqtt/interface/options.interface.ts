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
}
