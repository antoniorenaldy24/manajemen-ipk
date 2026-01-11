import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const getRedisConnection = () => {
    // Common connection options
    const options = {
        maxRetriesPerRequest: null, // Required by BullMQ
        enableReadyCheck: false,
    };

    const connection = new IORedis(REDIS_URL, options);

    connection.on('error', (err) => {
        console.error('[Redis] Connection Error:', err);
    });

    return connection;
};

// Singleton pattern for reuse across stateless serverless functions if needed,
// though BullMQ manages its own connections usually.
// Best practice is to export a shared connection instance or factory.

declare const globalThis: {
    redisGlobal: IORedis;
} & typeof global;

const redis = globalThis.redisGlobal ?? getRedisConnection();

if (process.env.NODE_ENV !== 'production') {
    globalThis.redisGlobal = redis;
}

export default redis;
