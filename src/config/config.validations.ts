import z from 'zod';

const zodNumber = z.preprocess(Number, z.number());

const schema = z.object({
  NODE_ENV: z.enum(['local', 'dev', 'staging', 'testnet', 'production']),
  PORT: zodNumber,

  // redis
  REDIS_URI: z.string(),
  REDIS_DB: zodNumber,

  // mongo
  MONGO_URI: z.string(),
  MONGO_DB_NAME: z.string(),

  // postgres
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: zodNumber,
  POSTGRES_USERNAME: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB_NAME: z.string(),

  // rabbitmq
  RMQ_URL: z.string(),
  RMQ_USERNAME: z.string(),
  RMQ_PASSWORD: z.string(),
  RMQ_HEARTBEAT: zodNumber.optional(),
  RMQ_QUEUE_DEVICE_COMMAND_SEND: z.string(),

  // mqtt
  MQTT_PORT: zodNumber.optional(),
  MQTT_ENABLE_TLS: z.boolean().optional(),
});

export default schema;
