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
  [K in keyof MQTTHookHandlers]: (fn: MQTTHookHandlers[K]) => MQTTHookHandlers[K];
} = {
  preConnect: (fn) => (...args) => fn(...args),
  authenticate: (fn) => (client, username, password, done) =>
    fn(client, username, password, done),
  authorizePublish: (fn) => (client, packet, callback) =>
    fn(client, packet, callback),
  authorizeSubscribe: (fn) => (client, subscription, callback) =>
    fn(client, subscription, callback),
  published: (fn) => (packet, client, callback) =>
    fn(packet, client, callback),
};