
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'rediss://default:AU7XAAIncDJmNDkyYzg3Y2RhOTY0MjVjYmYzY2E5ZmM4ZGUyOTI5ZXAyMjAxODM@first-wombat-20183.upstash.io:6379';

async function testConnection() {
    console.log('Connecting to Redis...');
    const redis = new Redis(redisUrl);

    try {
        await redis.set('test-key', 'Hello Nexusware');
        const value = await redis.get('test-key');
        console.log('✅ Redis Connected Successfully!');
        console.log('Value retrieved:', value);
    } catch (error) {
        console.error('❌ Redis Connection Failed:', error);
    } finally {
        redis.quit();
    }
}

testConnection();
