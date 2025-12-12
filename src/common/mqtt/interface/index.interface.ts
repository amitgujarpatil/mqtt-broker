import { AedesOptions,  AuthenticateHandler, AuthorizePublishHandler, AuthorizeSubscribeHandler, Client,SubscribePacket, ConnectPacket, PublishPacket, Subscription } from "aedes";

// masked export to avoid circular dependencies
export interface MQTTClient extends Client {}
export interface MQTTPublishPacket extends PublishPacket {}
export interface MQTTConnectPacket extends ConnectPacket {}
export interface MQTTSubscription extends Subscription {}
export interface MQTTSubscribePacket extends SubscribePacket {}

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

export interface MqttSubscribeOptions {
  qos?: 0 | 1 | 2;
}

export interface MqttMessage {
  topic: string;
  payload: Buffer | string;
  qos: 0 | 1 | 2;
  retain: boolean;
}


