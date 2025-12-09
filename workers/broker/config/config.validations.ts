import z from 'zod';

const zodNumber = z.preprocess(Number, z.number());

const schema = z.object({
  NODE_ENV: z.enum(['local', 'dev', 'staging', 'testnet', 'production']),
  PORT: zodNumber,

  // redis
  REDIS_URI: z.string(),
  REDIS_DB: zodNumber,

  // mongo
  MONGO_URI: z.string().optional(),
  MONGO_DB_NAME: z.string().optional(),

  // postgres
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PORT: zodNumber.optional(),
  POSTGRES_USERNAME: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB_NAME: z.string().optional(),

  // rabbitmq
  RMQ_URL: z.string(),
  RMQ_USERNAME: z.string(),
  RMQ_PASSWORD: z.string(),
  RMQ_HEARTBEAT: zodNumber.optional(),
  RMQ_QUEUE_DEVICE_COMMAND_SEND: z.string(),
});

export default schema;
