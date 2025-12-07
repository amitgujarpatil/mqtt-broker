import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';
import { ConfigVariablesType } from '../../config';

@Injectable()
export class RedisService {
  private _logger = new Logger(RedisService.name);

  private _client: RedisClientType;
  private _cfg: ConfigVariablesType['db']['redis'];

  constructor(readonly configService: ConfigService) {
     this.connect();
  }

  async connect(){
      this._cfg = this.configService.get('db.redis');
      this._client = createClient(this._cfg);
      this._client.on('connect', this.handleConnect);
      this._client.on('disconnect', this.handleDisconnect);
      this._client.on('error', this.handleError);

      this._addRedisMethods();

      await this._client.connect();
  }

  getClient(): RedisClientType {
    return this._client;
  }

  // TODO - add more methods here instead of creating them in the service
  private _addRedisMethods() {
    const methods = ['sadd', 'srem', 'sismember', 'del'] as const;
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

  private handleConnect = () => {
    this._logger.log('REDIS CONNECTED :)');
  };

  private handleDisconnect = () => {
    this._logger.log('REDIS DISCONNECTED :(');
  };

  private handleError = (e: unknown) => {
    console.log(e)
    this._logger.log('REDIS ERROR :O', e);
  };

  async scanKeys(PATTERN: string): Promise<string[]> {
    const redisClient = this._client;
    let _cursor = '0';
    let keyList = [];
    return new Promise(async (resolve, reject) => {
      (async function scanRecursive(pattern) {
        try{
          const {cursor,keys}  = await redisClient.scan(_cursor,{
            COUNT:250,
            MATCH:pattern,
          })

          keyList.push(...keys);
          _cursor = cursor;

          if (cursor === '0') {
            return resolve([...new Set(keyList)]);
          }
          
          return scanRecursive(pattern);
        }catch(e){
            return reject(e);
        }
      })(PATTERN);
    });
  }

  async exists(key) {
    return this._client.exists(key);
  }

  async get(key: string) {
    return this._client.get(key);
  }

  async incr(key: string) {
    return this._client.incr(key);
  }

  async decr(key: string) {
    return this._client.decr(key);
  }

  async set(key: string, value: string, ttl?: number) {
    return ttl
      ? this._client.setEx(key, ttl, value)
      : this._client.set(key, value);
  }

  async getKeys(pattern: string) {
    return this._client.keys(pattern);
  }

  async deleteCache(keys: string[]) {
    return this.del(keys);
  }

  async hGet(key: string, field: string) {
    return this._client.hGet(key, field);
  }

  async hGetAll(key: string) {
    return this._client.hGetAll(key);
  }

  async hSet(key: string, field: string, value: string | number) {
    return this._client.hSet(key, field, value);
  }

  async hIncrBy(key: string, field: string, value: number) {
    return this._client.hIncrBy(key, field, value);
  }

  async zAdd(key: string, score: number, member: string): Promise<boolean> {
    return !!(this._client.zAdd(key, {
        score,
        value:member
      }));
  }
}

// declaration merging - merge these methods into the RedisService
export interface RedisService {
  sadd: (key: string, value: string | string[]) => Promise<number>;
  srem: (key: string, value: string) => Promise<number>;
  sismember: (key: string, value: string) => Promise<number>;
  del: (keys: string[]) => Promise<number>;
}
