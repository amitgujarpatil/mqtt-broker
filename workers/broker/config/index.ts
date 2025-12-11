import { IRMQConfigVariables } from './config.types';
import validationSchema from './config.validations';
import RmqRoutingKeyEnum from 'src/common/rmq/enum/rmq.routing.key.enum';
import RmqQueueEnum from 'src/common/rmq/enum/rmq.queue.enum';
import RmqExchangeEnum from 'src/common/rmq/enum/rmq.exchange.enum';

const config = (config: Record<string, unknown>) => {
  const ENVS = validationSchema.parse(config);
  const NODE_ENV = ENVS.NODE_ENV;
  const APP_NAME = `broker-${NODE_ENV}`;
  const PORT = ENVS.PORT;

  return {
    app: {
      name: APP_NAME,
      port: PORT,
      env: NODE_ENV,
    },
    broker: {
      rmq: {
        connectionOptions: {
          url: ENVS.RMQ_URL,
          heartbeat: ENVS.RMQ_HEARTBEAT || 60,
          vhost: '/ait',
          connectionOptions: {
            keepAlive: true,
            keepAliveDelay: 30000, // 30 seconds
          },
        },
        exchanges: [
          {
            name: RmqExchangeEnum.DEVICE_MESSAGE_RECEIVE,
            type: 'topic',
            options: { durable: true },
          },
          {
            name: RmqExchangeEnum.DEVICE_COMMAND_SEND,
            type: 'topic',
            options: { durable: true },
          },
          {
            name: RmqExchangeEnum.DEVICE_HANDSHAKE,
            type: 'topic',
            options: { durable: true },
          },
          {
            name: RmqExchangeEnum.DEVICE_COMMAND_BROADCAST,
            type: 'fanout',
            options: { durable: true },
          },
        ],
        queues: [
          {
            name: RmqQueueEnum.DEVICE_MESSAGE_RECEIVE,
            options: { durable: true },
          },
          {
            name: RmqQueueEnum.DEVICE_HANDSHAKE,
            options: { durable: true },
          },
          {
            name: RmqQueueEnum.DEVICE_COMMAND_SEND,
            options: { durable: true },
          },
        ],
        bindings: [
          {
            queue: RmqQueueEnum.DEVICE_COMMAND_SEND,
            exchange: RmqExchangeEnum.DEVICE_COMMAND_BROADCAST,
            routingKey: '',
          },
          {
            queue: RmqQueueEnum.DEVICE_MESSAGE_RECEIVE,
            exchange: RmqExchangeEnum.DEVICE_MESSAGE_RECEIVE,
            routingKey: RmqRoutingKeyEnum.DEVICE_MESSAGE_RECEIVE,
          },
          {
            queue: RmqQueueEnum.DEVICE_HANDSHAKE,
            exchange: RmqExchangeEnum.DEVICE_HANDSHAKE,
            routingKey: RmqRoutingKeyEnum.DEVICE_HANDSHAKE,
          },
          {
            queue: RmqQueueEnum.DEVICE_COMMAND_SEND,
            exchange: RmqExchangeEnum.DEVICE_COMMAND_SEND,
            routingKey: RmqQueueEnum.DEVICE_COMMAND_SEND,
          },
        ],
        createExchanges: true,
        createQueues: true,
        createBindings: true,
      } as IRMQConfigVariables,
    },
    compression: {
      enabled: true,
      algorithm: 'gzip',
      level: 6,
      threshold: 1024,
    },
    db: {
      mongo: {
        uri: ENVS.MONGO_URI,
        dbName: ENVS.MONGO_DB_NAME,
      },
      redis: {
        url: ENVS.REDIS_URI,
        database: ENVS.REDIS_DB,
      },
      postgres: {
        host: ENVS.POSTGRES_HOST,
        port: ENVS.POSTGRES_PORT,
        username: ENVS.POSTGRES_USERNAME,
        password: ENVS.POSTGRES_PASSWORD,
        dbName: ENVS.POSTGRES_DB_NAME,
      },
    },
  } as const;
};

export type ConfigVariablesType = ReturnType<typeof config>;

export default config;
