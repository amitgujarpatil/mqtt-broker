import { SetMetadata } from '@nestjs/common';
import { MQTT_SUBSCRIBER_PARAMS_CONSTANT } from '../constant';

export interface MqttSubscriberMetadata {
  topic: string;
  qos?: 0 | 1 | 2;
}

export const MqttSubscribe = (topic: string, qos: 0 | 1 | 2 = 0): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata(MQTT_SUBSCRIBER_PARAMS_CONSTANT, { topic, qos })(target, propertyKey, descriptor);
    return descriptor;
  };
};