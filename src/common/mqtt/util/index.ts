import { MQTTEventHandlers } from "../interface";

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
