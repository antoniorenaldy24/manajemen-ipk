const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

// Re-implement crypto utils in JS to avoid import issues
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');

function hashNIM(nim) {
    return crypto.createHash('sha256').update(nim).digest('hex');
}

function encryptNIM(nim) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(nim, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

const prisma = new PrismaClient({ log: ['info'] });

async function main() {
    console.log('Seeding database... (JS Mode)');
    console.log('DB_URL set:', !!process.env.DATABASE_URL);

    // 1. UPM (Admin)
    const upmUser = await prisma.user.upsert({
        where: { email: '198001' },
        update: {},
        create: {
            email: '198001',
            password_hash: bcrypt.hashSync('adminUPM2026', 10),
            role: 'UPM', // String literal if enum fails in JS
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
            password_hash: bcrypt.hashSync('kaprodi75', 10),
            role: 'KAPRODI',
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
        await prisma.user.upsert({
            where: { email: s.nim },
            update: {},
            create: {
                email: s.nim,
                password_hash: bcrypt.hashSync(s.pass, 10),
                role: 'MAHASISWA',
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
