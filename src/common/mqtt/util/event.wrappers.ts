import { MQTTEventType } from "../type";

export const EVENT_WRAPPERS: Record<MQTTEventType, any> = {
  closed: function (fn) {
    return () => fn();
  },

  client: function (fn) {
    return (client) => fn(client);
  },

  clientReady: function (fn) {
    return (client) => fn(client);
  },

  clientDisconnect: function (fn) {
    return (client) => fn(client);
  },

  clientError: function (fn) {
    return (client, error) => fn(client, error);
  },

  connectionError: function (fn) {
    return (client, error) => fn(client, error);
  },

  publish: function (fn) {
    return (packet, client) => fn(packet, client);
  },

  ack: function (fn) {
    return (packet, client) => fn(packet, client);
  },

  subscribe: function (fn) {
    return (subs, client) => fn(subs, client);
  },

  unsubscribe: function (fn) {
    return (topics, client) => fn(topics, client);
  },

  connackSent: function (fn) {
    return (packet, client) => fn(packet, client);
  },

  keepaliveTimeout: function (fn) {
    return (client) => fn(client);
  },

  ping: function (fn) {
    return (packet, client) => fn(packet, client);
  },
};
