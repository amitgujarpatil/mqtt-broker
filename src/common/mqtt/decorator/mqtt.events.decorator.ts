import { MQTT_BROKER_EVENTS_METADATA_CONSTANT } from '../constant';
import { MQTTEventHandlers } from '../interface';
import { MQTTEventType } from '../type';

/**
 * Decorator for marking a method as an MQTT event handler.
 * 
 * The decorated method will be registered for the specified MQTT event type
 * and must match the signature for that event.
 * 
 * @example
 * ```typescript
 * class MyBroker {
 *   @MQTTEvent('client')
 *   onClient(client: Client) {
 *     // TypeScript enforces correct signature
 *   }
 * 
 *   @MQTTEvent('publish')
 *   onPublish(packet: AedesPublishPacket, client: Client | null) {
 *     // Handler for publish events
 *   }
 * }
 * ```
 */
export function MQTTEvent<T extends MQTTEventType>(
  event: T
): (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<MQTTEventHandlers[T]>
) => void {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      MQTT_BROKER_EVENTS_METADATA_CONSTANT,
      event,
      target,
      propertyKey
    );
    return descriptor;
  };
}

