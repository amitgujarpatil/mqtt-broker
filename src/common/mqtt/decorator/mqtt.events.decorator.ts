import { MQTT_BROKER_EVENTS_METADATA_CONSTANT } from '../constant';
import { MQTTEventType } from '../type';

/**
 * Decorator for marking a method as an MQTT event handler.
 *
 * The decorated method will be registered for the specified MQTT event type.
 *
 * @param {MQTTEventType} event The MQTT event type to handle.
 *
 * @example
 * ```
 *  .@MQTTEvent('connect')
 *  onConnect(client: MQTTClient) {
 *   // handle connect event
 *  }
 * ```
 */
export function MQTTEvent(event: MQTTEventType): MethodDecorator {
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

