import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { encryptNIM, hashNIM } from '../src/lib/security/crypto';

// Setup Driver Adapter for Seeding (Replicating lib/db.ts)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['info'] });

console.log('DB_URL:', !!process.env.DATABASE_URL);
console.log('ENCRYPTION_KEY:', !!process.env.ENCRYPTION_KEY); // Verify Key Presence

async function main() {
    console.log('Seeding database...');

    // 1. UPM (Admin)
    const upmUser = await prisma.user.upsert({
        where: { email: '198001' },
        update: {},
        create: {
            email: '198001',
            password_hash: hashSync('adminUPM2026', 10),
            role: Role.UPM,
            created_by: '00000000-0000-0000-0000-000000000000',
        },
    });
    console.log('Created UPM:', upmUser.email);

    // 2. KaProdi
    const kaprodiUser = await prisma.user.upsert({
        where: { email: '197505' },
        update: {},
        create: {
            email: '197505',
            password_hash: hashSync('kaprodi75', 10),
            role: Role.KAPRODI,
            created_by: upmUser.id,
        },
    });
    console.log('Created KaProdi:', kaprodiUser.email);

    // 3. Students
    const students = [
        { nim: '21051201', name: 'Ahmad Fauzi', pass: 'mhs001' },
        { nim: '21051202', name: 'Siti Aminah', pass: 'mhs002' },
        { nim: '21051203', name: 'Budi Santoso', pass: 'mhs003' },
    ];

    for (const s of students) {
        // Upsert User using NIM as email
        await prisma.user.upsert({
            where: { email: s.nim },
            update: {},
            create: {
                email: s.nim,
                password_hash: hashSync(s.pass, 10),
                role: Role.MAHASISWA,
                created_by: upmUser.id,
                student: {
                    create: {
                        name: s.name,
                        nim_hash: hashNIM(s.nim),
                        nim_encrypted: encryptNIM(s.nim),
                        batch_year: 2021,
                        current_semester: 6,
                        ipk: 0.00,
                        status: 'AMAN',
                    },
                },
            },
        });
        console.log(`Created Student: ${s.name} (${s.nim})`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
