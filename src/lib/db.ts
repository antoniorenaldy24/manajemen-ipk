import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const getConnectionString = () => {
    const urlStr = process.env.DATABASE_URL;
    if (!urlStr) return undefined;

    try {
        const url = new URL(urlStr);
        // Strip sslmode to prevent conflicts with our explicit ssl config
        url.searchParams.delete('sslmode');
        return url.toString();
    } catch (e) {
        console.error('[DB] Invalid DATABASE_URL', e);
        return urlStr;
    }
};

const connectionString = getConnectionString();

console.log('[DB] Initializing connection pool...');
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Force accept self-signed
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error', err);
});
pool.on('connect', () => {
    console.log('[DB] New client connected');
});
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
    return new PrismaClient({
        adapter,
        log: ['error', 'warn']
    });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}
