import { MQTT_BROKER_HOOKS_METADATA_CONSTANT } from '../constant/index.constant';

/**
 * Decorator for marking a method as the MQTT authentication handler.
 *
 * The decorated method will be used to authenticate incoming MQTT clients.
 *
 * **Required Signature:**
 * @param {client} client The connecting client instance (`MQTTClient`).
 * @param {username} username Username sent by the client (`string | undefined`).
 * @param {password} password Password sent by the client (`string | undefined`).
 * @returns {boolean | Promise<boolean>} Whether authentication succeeds will be determined by the return value.
 *       - Return `true` to authenticate.
 *       - Return `false` to reject.
 *
 * @example
 * ```
 *    .@MQTTAuthenticate()
 *    authenticate(client: MQTTClient, username?: string, password?: string): boolean {
 *      return username === 'admin' && password === 'secret';
 *    }
 * ```
 */
export function MQTTAuthenticate(): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(
            MQTT_BROKER_HOOKS_METADATA_CONSTANT,
            "authenticate", // method name to register this handler to aedes
            target,
            propertyKey,
        );
        return descriptor;
    };
}

/**
 * Decorator for marking a method as the publish-authorization handler.
 *
 * The decorated method is invoked whenever a client attempts to publish a packet.
 *
 * **Required Signature:**
 * @param {client} client The publishing client (`MQTTClient | null`).  Aedes may provide `null` for broker-internal messages.
 * @param {packet} packet The MQTT publish packet (`MQTTPublishPacket`).
 * @returns {boolean | void | Promise<boolean>} 
 *          - Return `false` to reject the publish.
 *          - Return `true`, `void`, or nothing to allow it.
 *
 * @example
 * ```
 *   .@MQTTAuthorizePublish()
 *    authorizePublish(client: MQTTClient | null, packet: MQTTPublishPacket): boolean {
 *      return packet.topic.startsWith("public/");
 *    }
 * ```
 */
export function MQTTAuthorizePublish(): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(MQTT_BROKER_HOOKS_METADATA_CONSTANT, "authorizePublish", target, propertyKey);
        return descriptor;
    };
}

/**
 * Decorator for marking a method as the subscription-authorization handler.
 *
 * The decorated method will be executed whenever a client attempts to subscribe.
 *
 * **Required Signature:**
 * @param {client} client The subscribing client (`MQTTClient`).
 * @param {subscription} subscription The subscription object (`MQTTSubscription` or `{ topic, qos }`).
 * @returns {boolean | Promise<boolean>} 
 *          - Return `false` to block the subscription.
 *          - Return `true` to allow it.
 *
 * @example
 * ```
 *    .@MQTTAuthorizeSubscribe()
 *    authorizeSubscribe(client: MQTTClient, subscription: MQTTSubscription): boolean {
 *      return client.id !== "banned-user";
 *    }
 * ```
 */
export function MQTTAuthorizeSubscribe(): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(MQTT_BROKER_HOOKS_METADATA_CONSTANT, "authorizeSubscribe", target, propertyKey);
        return descriptor;
    };
}

/**
 * Decorator for marking a method as the published-packet handler.
 *
 * The decorated method will be called whenever the broker successfully processes a PUBLISH packet.
 *
 * **Required Signature:**
 * @param {client} client The publishing client (`MQTTClient`).
 * @param {packet} packet The published packet (`MQTTPublishPacket`).
 *
 * @returns {boolean | void | Promise<boolean>}
 *
 * @example
 * ```
 *   .@MQTTPublished()
 *   onPublished(client: MQTTClient, packet: MQTTPublishPacket): void {
 *     console.log("Message processed:", packet.topic);
 *   }
 * ```
 */
export function MQTTPublished(): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(MQTT_BROKER_HOOKS_METADATA_CONSTANT, "published", target, propertyKey);
        return descriptor;
    };
}

/**
 * Decorator for marking a method as the pre-connect handler.
 *
 * Runs *before* MQTT handshake. Useful for blocking clients early.
 *
 * **Required Signature:**
 * @param {client} client The raw connecting client (`MQTTClient`).
 * @param {packet} packet The incoming CONNECT packet (`MQTTConnectPacket`).
 * @returns {boolean | Promise<boolean>} 
 *          - Return `false` to reject connection.
 *          - Return `true` to proceed.
 *
 * @example
 * ```
 *   .@MQTTPreConnect()
 *   preConnect(client: Client, packet: ConnectPacket): boolean {
 *     return packet.clientId !== '';
 *   }
 * ```
 */
export function MQTTPreConnect(): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(MQTT_BROKER_HOOKS_METADATA_CONSTANT, "preConnect", target, propertyKey);
        return descriptor;
    };
}