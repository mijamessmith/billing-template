import { createClient, RedisClientType } from 'redis';
import logger from '../logger';

class RedisClient {
  private client: RedisClientType;

  constructor() {
    if (process.env.NODE_ENV === 'docker') {
      this.client = createClient({
        socket: {
          port: 6379,
          host: 'redis'
        }
      });
    } else {
      this.client = createClient();
    }

    this.client.on('error', (err) => {
      logger.error(`Redis Client Error: ${err}`);
    });

    this.client.connect();
  }

  async set(key: string, value: string): Promise<string | null> {
    await this.client.set(key, value);
    return this.client.get(key);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async pexpire(key: string, timeout: number): Promise<boolean> {
    return this.client.pExpire(key, timeout);
  }
  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
const client = new RedisClient();
export default client;
