export type DynamicModuleOptions<T> = {
  useFactory: (
    ...args: any[]
  ) => Promise<T> | T;
  inject?: any[];
  useValue?: T;
  useClass?: new (...args: any[]) => T;
};

export type MQTTEventType = 'client' | 'closed' | 'clientReady' | 'clientDisconnect' | 'clientError' | 'connectionError' | 'publish' | 'ack' | 'subscribe' | 'unsubscribe' | 'connackSent' | 'keepaliveTimeout' | 'ping';

export type MQTTEventHandler = {
  event: MQTTEventType;
  callback: (...args: any[]) => void | Promise<void>;
};