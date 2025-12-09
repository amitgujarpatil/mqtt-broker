import 'reflect-metadata';
import { RMQParamType } from '../enum/rmq.params.enum';
import { RMQ_PARAM_METADATA } from '../constants';

function registerParam(
  target: any,
  key: string,
  index: number,
  type: RMQParamType,
  data?: any,
) {
  const existing = Reflect.getMetadata(RMQ_PARAM_METADATA, target[key]) || [];
  existing.push({ index, type, data });
  Reflect.defineMetadata(RMQ_PARAM_METADATA, existing, target[key]);
}

export function RMQMessage(data?: string) {
  return (target: any, key: string, index: number) =>
    registerParam(target, key, index, RMQParamType.MESSAGE, data);
}

export function RMQRawMessage() {
  return (target: any, key: string, index: number) =>
    registerParam(target, key, index, RMQParamType.RAW_MESSAGE);
}

export function RMQChannel() {
  return (target: any, key: string, index: number) =>
    registerParam(target, key, index, RMQParamType.CHANNEL);
}

export function RMQFields(data?: string) {
  return (target: any, key: string, index: number) =>
    registerParam(target, key, index, RMQParamType.FIELDS, data);
}

export function RMQHeaders(data?: string) {
  return (target: any, key: string, index: number) =>
    registerParam(target, key, index, RMQParamType.HEADERS, data);
}
