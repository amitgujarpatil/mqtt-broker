import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';
import { ConfigVariablesType } from '../../config';

type RedisClientConfig = ConfigVariablesType['db']['redis'];

@Injectable()
export class RedisService implements OnModuleInit {
  private _logger = new Logger(RedisService.name);

  private _client: RedisClientType;
  private _cfg: RedisClientConfig;

  constructor(readonly configService: ConfigService) {   
  }
  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    this._cfg = this.configService.get('db.redis');
    this._client = this.createNewClient(this._cfg);

    this._addRedisMethods();

    await this._client.connect();
  }

  getClient(): RedisClientType {
    return this._client;
  }

  private createNewClient(config: RedisClientConfig): RedisClientType {
    const newClient = createClient(config);

    newClient.on('connect', () => {
      this._logger.log('REDIS CONNECTED :)');
    });

    newClient.on('disconnect', () => {
      this._logger.log('REDIS DISCONNECTED :(');
    });

    newClient.on('error', (e: unknown) => {
      console.log(e);
      this._logger.log('REDIS ERROR :O', e);
    });

    return newClient as RedisClientType;
  }

  // TODO - add more methods here instead of creating them in the service
  private _addRedisMethods() {
    const methods = [
      'sadd',
      'srem',
      'sismember',
      'del',
      'scanKeys',
      'get',
      'set',
      'hget',
      'hset',
      'hdel',
      'incr',
      'decr',
      'expire',
      'ttl',
      'lpush',
      'rpush',
      'lpop',
      'rpop',
      'lrange',
      'llen',
      'exists',
      'flushAll',
      'flushDb',
      'INCR',
      'DECR',
      'HMSET',
      'HGETALL',
      'hSet',
      'hGet',
    ] as const;
    methods.forEach((method) => {
      (this as any)[method] = (...args: unknown[]) => {
        return new Promise((resolve, reject) => {
          this._client[method](...args, (err: Error, res: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      };
    });
  }

  async scanKeys(PATTERN: string) {
    const redisClient = this._client;
    let _cursor = '0';
    let keyList = [];
    (async function scanRecursive(pattern) {
      try {
        const { cursor, keys } = await redisClient.scan(_cursor, {
          COUNT: 250,
          MATCH: pattern,
        });

        keyList.push(...keys);
        _cursor = cursor;

        if (cursor === '0') {
          return [...new Set(keyList)];
        }

        return scanRecursive(pattern);
      } catch (e) {
        throw e;
      }
    })(PATTERN);
  }
}

// declaration merging - merge these methods into the RedisService
export interface RedisService {
  sadd: (key: string, value: string | string[]) => Promise<number>;
  srem: (key: string, value: string) => Promise<number>;
  sismember: (key: string, value: string) => Promise<number>;
  del: (keys: string[]) => Promise<number>;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<'OK'>;
  hget: (key: string, field: string) => Promise<string | null>;
  hset: (key: string, field: string, value: string) => Promise<number>;
  hdel: (key: string, field: string) => Promise<number>;
  incr: (key: string) => Promise<number>;
  decr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  lpush: (key: string, value: string | string[]) => Promise<number>;
  rpush: (key: string, value: string | string[]) => Promise<number>;
  lpop: (key: string) => Promise<string | null>;
  rpop: (key: string) => Promise<string | null>;
  lrange: (key: string, start: number, stop: number) => Promise<string[]>;
  llen: (key: string) => Promise<number>;
  exists: (key: string) => Promise<number>;
  flushAll: () => Promise<'OK'>;
  flushDb: () => Promise<'OK'>;
}
