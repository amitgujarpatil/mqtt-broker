import { Client,SubscribePacket, ConnectPacket, PublishPacket, Subscription } from "aedes";

// masked export to avoid circular dependencies
export interface MQTTClient extends Client {}
export interface MQTTPublishPacket extends PublishPacket {}
export interface MQTTConnectPacket extends ConnectPacket {}
export interface MQTTSubscription extends Subscription {}
export interface MQTTSubscribePacket extends SubscribePacket {}