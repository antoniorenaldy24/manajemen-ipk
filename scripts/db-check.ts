import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
    console.log('Testing connection...');
    const url = process.env.DATABASE_URL;

    if (!url) {
        console.error('DATABASE_URL is missing!');
        process.exit(1);
    }

    console.log('DATABASE_URL starts with:', url.substring(0, 10) + '...');

    try {
        const pool = new Pool({ connectionString: url });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        console.log('Connecting to Prisma...');
        await prisma.$connect();
        console.log('Successfully connected.');

        const count = await prisma.user.count();
        console.log('User count:', count);

        await prisma.$disconnect();
        await pool.end();
    } catch (e) {
        console.error('Connection failed:', e);
        process.exit(1);
    }
}

main();
