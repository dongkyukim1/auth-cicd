import Redis from 'ioredis';

let redisClient: Redis | null = null;

export async function createRedisClient(): Promise<Redis> {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = new Redis(url);
  redisClient.on('connect', () => console.log('[redis] connected'));
  redisClient.on('error', (err) => console.error('[redis] error', err));
  return redisClient;
}

export function getRedis(): Redis {
  if (!redisClient) throw new Error('Redis not initialized');
  return redisClient;
}
