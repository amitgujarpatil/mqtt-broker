import {
  Client,
  SubscribePacket,
  ConnectPacket,
  PublishPacket,
  Subscription,
  ConnackPacket,
  PingreqPacket,
  AedesPublishPacket,
  PubrelPacket,
} from 'aedes';

// masked export to avoid circular dependencies
export interface MQTTClient extends Client {}
export interface MQTTPublishPacket extends PublishPacket {}
export interface MQTTConnectPacket extends ConnectPacket {}
export interface MQTTSubscription extends Subscription {}
export interface MQTTSubscribePacket extends SubscribePacket {}

export interface MQTTPubrelPacket extends PubrelPacket {}
export interface MQTTConnackPacket extends ConnackPacket {}
export interface MQTTPingreqPacket extends PingreqPacket {}
export interface MQTTPublishedPacket extends AedesPublishPacket {}

// Map of event types to their handler signatures
export interface MQTTEventHandlers {
  closed: () => void;
  client: (client: MQTTClient) => void;
  clientReady: (client: MQTTClient) => void;
  clientDisconnect: (client: MQTTClient) => void;
  keepaliveTimeout: (client: MQTTClient) => void;
  clientError: (client: MQTTClient, error: Error) => void;
  connectionError: (client: MQTTClient, error: Error) => void;
  connackSent: (packet: MQTTConnackPacket, client: MQTTClient) => void;
  ping: (packet: MQTTPingreqPacket, client: MQTTClient) => void;
  publish: (packet: MQTTPublishPacket, client: MQTTClient | null) => void;
  ack: (
    packet: MQTTPublishPacket | MQTTPubrelPacket,
    client: MQTTClient,
  ) => void;
  subscribe: (subscriptions: MQTTSubscription[], client: MQTTClient) => void;
  unsubscribe: (unsubscriptions: string[], client: MQTTClient) => void;
}

export type MQTTEventType = keyof MQTTEventHandlers;
export type MQTTEventHandler = {
  event: MQTTEventType;
  callback: (...args: any[]) => void | Promise<void>;
};

type MQTTPreConnectHandler = (
  client: MQTTClient,
  packet: MQTTConnectPacket,
  callback: (error: Error | null, success: boolean) => void,
) => void | Promise<void>;

type MQTTAuthenticateHandler = (
  client: MQTTClient,
  username: string,
  password: Buffer,
  done?: (error: Error | null, success: boolean | null) => void,
) => void | Promise<void>;

type MQTTAuthorizePublishHandler = (
  client: MQTTClient | null,
  packet: MQTTPublishPacket,
  callback: (error?: Error | null) => void,
) => void | Promise<void>;

type MQTTAuthorizeSubscribeHandler = (
  client: MQTTClient | null,
  subscription: MQTTSubscription,
  callback: (
    error: Error | null,
    subscription?: MQTTSubscription | null,
  ) => void,
) => void | Promise<void>;

type MQTTPublishedHandler = (
  packet: MQTTPublishedPacket,
  client: MQTTClient | null,
  callback: (error?: Error | null) => void,
) => void | Promise<void>;

export interface MQTTHookHandlers {
  preConnect: MQTTPreConnectHandler;
  authenticate: MQTTAuthenticateHandler;
  authorizePublish: MQTTAuthorizePublishHandler;
  authorizeSubscribe: MQTTAuthorizeSubscribeHandler;
  published: MQTTPublishedHandler;
}

export type MQTTHookType = keyof MQTTHookHandlers;
export type MQTTHookHandler = {
  hook: MQTTHookType;
  callback: (...args: any[]) => void | Promise<void>;
};
