import { MQTT_BROKER_HOOKS_METADATA_CONSTANT } from '../constant';
import { MQTTHookEnum } from '../enum';
import { MQTTHookHandlers, MQTTHookType } from '../interface';

export type MQTTHookDecorator<T extends MQTTHookType> = (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<MQTTHookHandlers[T]>,
) => void;

/** * Decorator for marking a method as an MQTT broker hook handler.
 *
 * This decorator binds a class method to a specific Aedes MQTT broker hook
 * while enforcing the correct method signature at compile-time.
 *
 * ## Usage
 * Apply `.@MQTTHook('<hookName>')` above a method. The method will be executed
 * whenever the corresponding broker hook is invoked.
 *
 * ## All Supported Hooks (with correct signatures)
 *
 * ### 1. `PRE_CONNECT`
 * Invoked before a client connects.
 * ```ts
 *   .@MQTTHook(MQTTHookEnum.PRE_CONNECT)
 *   async handlePreConnect(
 *     client: MQTTClient,
 *     packet: MQTTConnectPacket,
 *     cb: (error: Error | null, success: boolean) => void
 *   ) {
 *     // Custom pre-connect logic
 *     cb(null, true);
 *   }
 * ```
 *
 * ### 2. `AUTHENTICATE`
 * Custom authentication logic.
 * ```ts
 *   .@MQTTHook(MQTTHookEnum.AUTHENTICATE)
 *   async authenticateUser(
 *     client: MQTTClient,
 *     username: string,
 *     password: Buffer,
 *     cb: (err?: Error | null, result?: boolean) => void
 *   ) {
 *     // Custom authentication logic
 *     cb(null, true);
 *   }
 * ```
 *
 * ### 3. `AUTHORIZE_PUBLISH`
 * Authorize publish requests.
 * ```ts
 *   .@MQTTHook(MQTTHookEnum.AUTHORIZE_PUBLISH)
 *   async authorizePublish(
 *     client: MQTTClient | null,
 *     packet: MQTTPublishPacket,
 *     cb: (error?: Error | null) => void
 *   ) {
 *     // Custom authorization logic
 *     cb(null);
 *   }
 * ```
 *
 * ### 4. `AUTHORIZE_SUBSCRIBE`
 * Authorize subscribe requests.
 * ```ts
 *   .@MQTTHook(MQTTHookEnum.AUTHORIZE_SUBSCRIBE)
 *   async authorizeSubscribe(
 *     client: MQTTClient | null,
 *     subscription: MQTTSubscription,
 *     cb: (error: Error | null, subscription?: MQTTSubscription | null) => void
 *   ) {
 *     // Custom authorization logic
 *     cb(null, subscription);
 *   }
 * ```
 *
 * ---
 *
 * ## How It Works
 * The decorator stores metadata on the method, which can later be discovered
 * via NestJS's `DiscoveryService` to inject actual hooks into your custom hook handler method.
 *
 * broker service will then read this metadata and automatically register
 * the method with the Aedes hook system:
 *
 * ```ts
 *   aedes.preConnect = async (client, packet, cb) => {};
 * ```
 *
 * @param hook The MQTT hook name to bind the method to.
 * @returns A method decorator that registers the handler for the specified hook.
 *
 * @example
 * ```typescript
 * class MQTTBrokerService {
 *   .@MQTTHook(MQTTHookEnum.AUTHENTICATE)
 *   async authenticateUser(
 *     client: MQTTClient,
 *     username: string,
 *     password: Buffer,
 *     cb: (err?: Error | null, result?: boolean) => void
 *   ) {
 *     // Custom authentication logic
 *     cb(null, true);
 *   }
 * }
 * ```
 */
export function MQTTHook<T extends MQTTHookType>(
  hook: MQTTHookEnum,
): MQTTHookDecorator<T> {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      MQTT_BROKER_HOOKS_METADATA_CONSTANT,
      hook,
      target,
      propertyKey,
    );
    return descriptor;
  };
}
