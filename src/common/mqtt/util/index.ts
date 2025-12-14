import { Logger } from "@nestjs/common";
import { MQTTEventHandlers, MQTTHookHandlers } from "../interface";

// Event wrappers with proper typing
export const EVENT_WRAPPERS: {
  [K in keyof MQTTEventHandlers]: (fn: MQTTEventHandlers[K]) => MQTTEventHandlers[K];
} = {
  closed: (fn) => () => fn(),
  client: (fn) => (client) => fn(client),
  clientReady: (fn) => (client) => fn(client),
  clientDisconnect: (fn) => (client) => fn(client),
  clientError: (fn) => (client, error) => fn(client, error),
  connectionError: (fn) => (client, error) => fn(client, error),
  publish: (fn) => (packet, client) => fn(packet, client),
  ack: (fn) => (packet, client) => fn(packet, client),
  subscribe: (fn) => (subs, client) => fn(subs, client),
  unsubscribe: (fn) => (topics, client) => fn(topics, client),
  connackSent: (fn) => (packet, client) => fn(packet, client),
  keepaliveTimeout: (fn) => (client) => fn(client),
  ping: (fn) => (packet, client) => fn(packet, client),
};

export const HOOK_WRAPPERS: {
  [K in keyof MQTTHookHandlers]: (fn: MQTTHookHandlers[K], logger?: Logger) => MQTTHookHandlers[K];
} = {
  preConnect: (fn, logger) => async (client, packet, cb) => {
    try {
      return await fn(client, packet, cb);
    } catch (error) {
      logger.error('[MQTT] preConnect error:', error);
    }
  },

  authenticate: (fn, logger) => async (client, username, password, cb) => {
    try {
      await fn(client, username, password, cb);
    } catch (error) {
      logger.error('[MQTT] authenticate error:', error);
    }
  },

  authorizePublish: (fn, logger) => async (client, packet, cb) => {
    try {
      return await fn(client, packet,cb);
    } catch (error) {
      logger.error('[MQTT] authorizePublish error:', error);
    }
  },

  authorizeSubscribe: (fn, logger) => async (client, subscription, cb) => {
    try {
      return await fn(client, subscription, cb);
    } catch (error) {
      logger.error('[MQTT] authorizeSubscribe error:', error);
    }
  },

  published: (fn, logger) => async (client, packet, cb) => {
    try {
      await fn(client, packet, cb);
    } catch (error) {
        logger.error('[MQTT] published error:', error);
    }
  },
};