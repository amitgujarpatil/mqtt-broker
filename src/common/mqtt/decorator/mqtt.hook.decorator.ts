import {  MQTT_BROKER_HOOKS_METADATA_CONSTANT } from '../constant';
import {  MQTTHookEnum } from '../enum';
import { MQTTHookHandlers, MQTTHookType } from '../interface';

export function MQTTHook<T extends MQTTHookType>(
  hook: MQTTHookEnum
): (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<MQTTHookHandlers[T]>
) => void {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      MQTT_BROKER_HOOKS_METADATA_CONSTANT,
      hook,
      target,
      propertyKey
    );
    return descriptor;
  };
}