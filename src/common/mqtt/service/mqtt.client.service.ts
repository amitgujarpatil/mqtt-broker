import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import * as mqtt from 'mqtt';
// import { MqttModuleOptions, MqttPublishOptions, MqttSubscribeOptions } from '../interfaces/mqtt.interface';
// import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MqttClientService implements OnModuleInit, OnModuleDestroy {

    constructor(){}

    onModuleDestroy() {
        //throw new Error('Method not implemented.');
    }
    onModuleInit() {
        //throw new Error('Method not implemented.');
    }

//   private readonly logger = new Logger(MqttClientService.name);
//   private client: mqtt.MqttClient;
//   private subscriptions = new Map<string, Set<(payload: Buffer, topic: string) => void>>();

//   constructor(
//     private readonly options: MqttModuleOptions,
//     private readonly eventEmitter: EventEmitter2,
//   ) {}

//   async onModuleInit() {
//     if (this.options.client?.enabled) {
//       await this.connect();
//     }
//   }

//   async onModuleDestroy() {
//     await this.disconnect();
//   }

//   private async connect(): Promise<void> {
//     const clientOptions = this.options.client;
//     if (!clientOptions || !clientOptions.enabled) {
//       return;
//     }

//     const url = `mqtt://${clientOptions.host}:${clientOptions.port}`;
    
//     this.client = mqtt.connect(url, {
//       clientId: clientOptions.clientId || `nestjs_${Math.random().toString(16).substr(2, 8)}`,
//       username: clientOptions.username,
//       password: clientOptions.password,
//       reconnectPeriod: clientOptions.reconnectPeriod || 1000,
//       clean: true,
//     });

//     return new Promise((resolve, reject) => {
//       this.client.on('connect', () => {
//         this.logger.log(`MQTT Client connected to ${url}`);
//         resolve();
//       });

//       this.client.on('error', (err) => {
//         this.logger.error(`MQTT Client error: ${err.message}`);
//         reject(err);
//       });

//       this.client.on('close', () => {
//         this.logger.log('MQTT Client disconnected');
//       });

//       this.client.on('reconnect', () => {
//         this.logger.log('MQTT Client reconnecting...');
//       });

//       this.client.on('message', (topic, payload) => {
//         this.handleMessage(topic, payload);
//       });
//     });
//   }

//   private handleMessage(topic: string, payload: Buffer): void {
//     this.logger.debug(`Received message on ${topic}`);

//     // Emit to EventEmitter for decorator-based subscribers
//     this.eventEmitter.emit(`mqtt.message.${topic}`, { topic, payload });

//     // Call registered callbacks
//     const callbacks = this.subscriptions.get(topic);
//     if (callbacks) {
//       callbacks.forEach((callback) => callback(payload, topic));
//     }

//     // Also check for wildcard subscriptions
//     this.subscriptions.forEach((callbacks, pattern) => {
//       if (this.matchTopic(pattern, topic)) {
//         callbacks.forEach((callback) => callback(payload, topic));
//       }
//     });
//   }

//   private matchTopic(pattern: string, topic: string): boolean {
//     const patternParts = pattern.split('/');
//     const topicParts = topic.split('/');

//     if (patternParts.length > topicParts.length) {
//       return false;
//     }

//     for (let i = 0; i < patternParts.length; i++) {
//       if (patternParts[i] === '#') {
//         return true;
//       }
//       if (patternParts[i] !== '+' && patternParts[i] !== topicParts[i]) {
//         return false;
//       }
//     }

//     return patternParts.length === topicParts.length;
//   }

//   // ==================== Public API ====================

//   /**
//    * Publish a message
//    */
//   async publish(
//     topic: string,
//     payload: string | Buffer,
//     options?: MqttPublishOptions,
//   ): Promise<void> {
//     if (!this.client || !this.client.connected) {
//       throw new Error('MQTT Client is not connected');
//     }

//     return new Promise((resolve, reject) => {
//       this.client.publish(
//         topic,
//         Buffer.isBuffer(payload) ? payload : Buffer.from(payload),
//         {
//           qos: options?.qos || 0,
//           retain: options?.retain || false,
//         },
//         (err) => {
//           if (err) {
//             this.logger.error(`Failed to publish to ${topic}: ${err.message}`);
//             reject(err);
//           } else {
//             this.logger.debug(`Published to ${topic}`);
//             resolve();
//           }
//         },
//       );
//     });
//   }

//   /**
//    * Subscribe to a topic
//    */
//   async subscribe(
//     topic: string,
//     callback?: (payload: Buffer, topic: string) => void,
//     options?: MqttSubscribeOptions,
//   ): Promise<void> {
//     if (!this.client || !this.client.connected) {
//       throw new Error('MQTT Client is not connected');
//     }

//     return new Promise((resolve, reject) => {
//       this.client.subscribe(topic, { qos: options?.qos || 0 }, (err) => {
//         if (err) {
//           this.logger.error(`Failed to subscribe to ${topic}: ${err.message}`);
//           reject(err);
//         } else {
//           this.logger.log(`Subscribed to ${topic}`);

//           if (callback) {
//             if (!this.subscriptions.has(topic)) {
//               this.subscriptions.set(topic, new Set());
//             }
//             this.subscriptions.get(topic).add(callback);
//           }

//           resolve();
//         }
//       });
//     });
//   }

//   /**
//    * Unsubscribe from a topic
//    */
//   async unsubscribe(topic: string): Promise<void> {
//     if (!this.client || !this.client.connected) {
//       throw new Error('MQTT Client is not connected');
//     }

//     return new Promise((resolve, reject) => {
//       this.client.unsubscribe(topic, (err) => {
//         if (err) {
//           this.logger.error(`Failed to unsubscribe from ${topic}: ${err.message}`);
//           reject(err);
//         } else {
//           this.logger.log(`Unsubscribed from ${topic}`);
//           this.subscriptions.delete(topic);
//           resolve();
//         }
//       });
//     });
//   }

//   /**
//    * Check if client is connected
//    */
//   isConnected(): boolean {
//     return this.client && this.client.connected;
//   }

//   /**
//    * Disconnect client
//    */
//   async disconnect(): Promise<void> {
//     if (this.client && this.client.connected) {
//       return new Promise((resolve) => {
//         this.client.end(false, {}, () => {
//           this.logger.log('MQTT Client disconnected');
//           resolve();
//         });
//       });
//     }
//   }

}