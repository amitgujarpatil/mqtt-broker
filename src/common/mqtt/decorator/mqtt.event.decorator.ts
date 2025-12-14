import { MQTT_BROKER_EVENTS_METADATA_CONSTANT } from '../constant';
import { MQTTEventEnum } from '../enum';
import { MQTTEventHandlers, MQTTEventType } from '../interface';

export type MQTTEventDecorator<T extends MQTTEventType> = (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<MQTTEventHandlers[T]>,
) => void;

/**
 * Decorator for marking a method as an MQTT broker event handler.
 *
 * This decorator binds a class method to a specific Aedes MQTT broker event
 * while enforcing the correct method signature at compile-time.
 *
 * ## Usage
 * Apply `.@MQTTEvent(MQTTEventEnum.<eventName>)` above a method. The method will be executed
 * whenever the corresponding broker event is emitted.
 *
 * ## All Supported Events (with correct signatures)
 *
 * ### 1. `closed`
 * Triggered when the broker fully shuts down.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.CLOSED)
 *   onClosed(): void {
 *     console.log('MQTT broker closed.');
 *   }
 * ```
 *
 * ### 2. `client`
 * Fired when a new client connects.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.CLIENT)
 *   onClient(client: MQTTClient): void {
 *     console.log('Client connected:', client.id);
 *   }
 * ```
 *
 * ### 3. `clientReady`
 * Client has completed connection and is ready.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.CLIENT_READY)
 *   onClientReady(client: MQTTClient): void {
 *     console.log('Client ready:', client.id);
 *   }
 * ```
 *
 * ### 4. `clientDisconnect`
 * Fired when a client begins disconnecting.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.CLIENT_DISCONNECT)
 *   onClientDisconnect(client: MQTTClient): void {
 *     console.log('Client disconnecting:', client.id);
 *   }
 * ```
 *
 * ### 5. `keepaliveTimeout`
 * Fired when a client's keepalive expires.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.KEEPALIVE_TIMEOUT)
 *   onKeepaliveTimeout(client: MQTTClient): void {
 *     console.log('Client keepalive timeout:', client.id);
 *   }
 * ```
 *
 * ### 6. `clientError`
 * Client-level error.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.CLIENT_ERROR)
 *   onClientError(client: MQTTClient, error: Error): void {
 *     console.error('Client error:', client.id, error.message);
 *   }
 * ```
 *
 * ### 7. `connectionError`
 * Error while establishing a connection.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.CONNECTION_ERROR)
 *   onConnectionError(client: MQTTClient, error: Error): void {
 *     console.error('Connection error:', error.message);
 *   }
 * ```
 *
 * ### 8. `connackSent`
 * Broker sent CONNACK response.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.CONNACK_SENT)
 *   onConnack(packet: MQTTConnackPacket, client: MQTTClient): void {
 *     console.log('CONNACK sent to:', client.id);
 *   }
 * ```
 *
 * ### 9. `ping`
 * Client sent PINGREQ.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.PING)
 *   onPing(packet: MQTTPingreqPacket, client: MQTTClient): void {
 *     console.log('Ping from:', client.id);
 *   }
 * ```
 *
 * ### 10. `publish`
 * Fired for every publish event (incoming or outgoing).
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.PUBLISH)
 *   onPublish(packet: MQTTPublishPacket, client: MQTTClient | null): void {
 *     console.log('Publish topic:', packet.topic, 'From client:', client?.id);
 *   }
 * ```
 *
 * ### 11. `ack`
 * Fired when PUBACK/PUBREL is received.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.ACK)
 *   onAck(packet: MQTTPublishPacket | MQTTPubrelPacket, client: MQTTClient): void {
 *     console.log('Ack from client:', client.id);
 *   }
 * ```
 *
 * ### 12. `subscribe`
 * Client subscribes to topics.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.SUBSCRIBE)
 *   onSubscribe(subs: MQTTSubscriptions, client: MQTTClient): void {
 *     console.log('Subscriptions from:', client.id, subs);
 *   }
 * ```
 *
 * ### 13. `unsubscribe`
 * Client unsubscribes from topics.
 * ```ts
 *   .@MQTTEvent(MQTTEventEnum.UNSUBSCRIBE)
 *   onUnsubscribe(topics: string[], client: MQTTClient): void {
 *     console.log('Unsubscribed:', topics, 'Client:', client.id);
 *   }
 * ```
 *
 * ---
 *
 * ## How It Works
 * The decorator stores metadata on the method, which can later be discovered
 * via NestJS's `DiscoveryService` to inject actual events into your custom event handler method.
 *
 * broker service will then read this metadata and automatically register
 * the method with the Aedes event emitter:
 *
 * ```ts
 *   aedes.on(event, (client:Client) => {});
 * ```
 *
 * @param event The MQTT event name to bind the method to.
 * @returns A method decorator that registers the handler for the specified event.
 *
 * @example
 * ```typescript
 * class MQTTBrokerService {
 *   .@MQTTEvent(MQTTEventEnum.CLIENT)
 *   handleNewClient(client: MQTTClient): void {
 *     console.log('New client connected:', client.id);
 *   }
 *
 *   .@MQTTEvent(MQTTEventEnum.PUBLISH)
 *   handlePublish(packet: MQTTPublishPacket, client: MQTTClient | null): void {
 *     console.log('Message published to:', packet.topic);
 *   }
 * }
 * ```
 */
export function MQTTEvent<T extends MQTTEventType>(
  event: MQTTEventEnum,
): MQTTEventDecorator<T> {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      MQTT_BROKER_EVENTS_METADATA_CONSTANT,
      event,
      target,
      propertyKey,
    );
    return descriptor;
  };
}
