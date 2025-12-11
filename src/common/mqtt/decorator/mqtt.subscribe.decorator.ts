import { SetMetadata } from '@nestjs/common';
import { MQTT_SUBSCRIBER_PARAMS } from '../constant/index.constant';

export interface MqttSubscriberMetadata {
  topic: string;
  qos?: 0 | 1 | 2;
}

export const MqttSubscribe = (topic: string, qos: 0 | 1 | 2 = 0): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata(MQTT_SUBSCRIBER_PARAMS, { topic, qos })(target, propertyKey, descriptor);
    return descriptor;
  };
};