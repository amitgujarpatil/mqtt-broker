import { MQTT_AUTH_HANDLER_METADATA } from "../constant/index.constant";

export function MqttAuthHandler() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(MQTT_AUTH_HANDLER_METADATA, true, target, propertyKey);
    return descriptor;
  };
}



// /**
//  * Decorator for publish authorization handler
//  */
// static MqttPublishAuthHandler(): MethodDecorator {
//     return (target, propertyKey, descriptor) => {
//         Reflect.defineMetadata('mqtt:publish_auth_handler', true, descriptor.value);
//     };
// }

// /**
//  * Decorator for subscribe authorization handler
//  */
// static MqttSubscribeAuthHandler(): MethodDecorator {
//     return (target, propertyKey, descriptor) => {
//         Reflect.defineMetadata('mqtt:subscribe_auth_handler', true, descriptor.value);
//     };
// }