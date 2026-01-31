import { RedisOptions } from 'bullmq';

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not defined in .env');
}

// Parse the REDIS_URL to get host, port, password
// rediss://default:PASSWORD@HOST:PORT
const url = new URL(process.env.REDIS_URL);

export const redisConfig: RedisOptions = {
    host: url.hostname,
    port: parseInt(url.port),
    password: url.password,
    username: url.username || 'default',
    tls: {
        rejectUnauthorized: false // Often needed for Upstash
    },
    maxRetriesPerRequest: null // Required by BullMQ
};
