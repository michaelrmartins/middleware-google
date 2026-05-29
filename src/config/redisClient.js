const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'server-redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected to', process.env.REDIS_HOST || 'server-redis');
});

module.exports = redis;
