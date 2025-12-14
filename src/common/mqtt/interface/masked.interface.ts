import { Client,SubscribePacket, ConnectPacket, PublishPacket, Subscription } from "aedes";
import type { 
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
  ack: (packet: MQTTPublishPacket | MQTTPubrelPacket, client: MQTTClient) => void;
  subscribe: (subscriptions: MQTTSubscription[], client: MQTTClient) => void;
  unsubscribe: (unsubscriptions: string[], client: MQTTClient) => void;
}
