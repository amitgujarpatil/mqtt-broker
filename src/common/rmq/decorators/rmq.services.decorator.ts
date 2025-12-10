import { Inject } from '@nestjs/common';
import {
  RMQ_PUBLISHER_SERVICE,
  RMQ_CONSUMER_SERVICE,
  RMQ_PUBLISHER_SERVICE_METADATA,
  RMQ_CONSUMER_SERVICE_METADATA,
} from '../constants';

export function RMQPublisherSvc() {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    Reflect.defineMetadata(RMQ_PUBLISHER_SERVICE_METADATA, true, target);
    Inject(RMQ_PUBLISHER_SERVICE)(target, propertyKey, parameterIndex);
  };
}

export function RMQConsumerService() {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    Reflect.defineMetadata(
      RMQ_CONSUMER_SERVICE_METADATA,
      true,
      target.constructor,
    );

    Inject(RMQ_CONSUMER_SERVICE)(target, propertyKey, parameterIndex);
  };
}
