import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { encryptNIM, hashNIM } from '../src/lib/security/crypto';

// Setup Driver Adapter
// Setup Driver Adapter
const rawConnectionString = process.env.DATABASE_URL;
let connectionString = rawConnectionString;

try {
    const url = new URL(rawConnectionString || '');
    url.searchParams.delete('sslmode');
    connectionString = url.toString();
} catch (e) {
    console.error('Failed to parse URL, using raw', e);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

// Diagnostics
pool.query('SELECT 1')
    .then(() => console.log('DEBUG: POOL OK (Connected)'))
    .catch(e => {
        console.error('DEBUG: POOL FAIL', e);
        process.exit(1); // Exit if pool fails
    });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const COURSES = {
    1: [
        { code: 'MK101', name: 'Algoritma Pemrograman', sks: 4 },
        { code: 'MK102', name: 'Matematika Diskrit', sks: 3 },
        { code: 'MK103', name: 'Bahasa Inggris', sks: 2 },
        { code: 'MK104', name: 'Pancasila', sks: 2 },
        { code: 'MK105', name: 'Pengantar TI', sks: 3 },
        { code: 'MK106', name: 'Fisika Dasar', sks: 3 },
    ],
    2: [
        { code: 'MK201', name: 'Struktur Data', sks: 4 },
        { code: 'MK202', name: 'Aljabar Linear', sks: 3 },
        { code: 'MK203', name: 'Bahasa Indonesia', sks: 2 },
        { code: 'MK204', name: 'Basis Data I', sks: 3 },
        { code: 'MK205', name: 'Arsitektur Komputer', sks: 3 },
        { code: 'MK206', name: 'Sistem Digital', sks: 3 },
    ],
    3: [
        { code: 'MK301', name: 'Pemrograman Berorientasi Objek', sks: 4 },
        { code: 'MK302', name: 'Basis Data II', sks: 3 },
        { code: 'MK303', name: 'Jaringan Komputer', sks: 3 },
        { code: 'MK304', name: 'Sistem Operasi', sks: 3 },
        { code: 'MK305', name: 'Statistika Probabilitas', sks: 3 },
        { code: 'MK306', name: 'Rekayasa Perangkat Lunak', sks: 3 },
    ],
    4: [
        { code: 'MK401', name: 'Pemrograman Web', sks: 4 },
        { code: 'MK402', name: 'Kecerdasan Buatan', sks: 3 },
        { code: 'MK403', name: 'Metodologi Penelitian', sks: 2 },
        { code: 'MK404', name: 'Interaksi Manusia Komputer', sks: 3 },
        { code: 'MK405', name: 'Keamanan Jaringan', sks: 3 },
        { code: 'MK406', name: 'Analisis Algoritma', sks: 3 },
    ]
};

const STUDENTS = [
    { name: 'Andi Pratama', nim: '23010001' },
    { name: 'Budi Santoso', nim: '23010002' },
    { name: 'Citra Kirana', nim: '23010003' },
    { name: 'Dewi Lestari', nim: '23010004' },
    { name: 'Eko Kurniawan', nim: '23010005' },
    { name: 'Fajar Nugraha', nim: '23010006' },
    { name: 'Gita Permata', nim: '23010007' },
    { name: 'Hendra Wijaya', nim: '23010008' },
    { name: 'Indah Sari', nim: '23010009' },
    { name: 'Joko Widodo', nim: '23010010' },
];

function randomGrade() {
    // Weight towards good grades, but sprinkle some bad ones
    const rand = Math.random();
    if (rand > 0.95) return 0.00; // E
    if (rand > 0.90) return 1.00; // D
    if (rand > 0.80) return 2.00; // C
    if (rand > 0.70) return 2.50; // C+
    if (rand > 0.55) return 3.00; // B
    if (rand > 0.35) return 3.50; // B+
    return 4.00; // A
}

async function main() {
    console.log('Starting seed for 10 Semester 5 Students...');

    // Get Admin User ID for created_by field
    const admin = await prisma.user.findFirst({ where: { role: Role.UPM } });
    if (!admin) throw new Error('UPM User not found. Please run main seed first.');

    // Batch 2023 => Sem 5 in early 2026?
    // If entered 2023:
    // 2023/2024 Sem 1 & 2
    // 2024/2025 Sem 3 & 4
    // 2025/2026 Sem 5 (NOW)
    const BATCH_YEAR = 2023;
    const CURRENT_SEMESTER = 5;

    for (const student of STUDENTS) {
        console.log(`Processing ${student.name}...`);

        // 1. Create User & Student
        // Using UPSERT to support re-running
        const user = await prisma.user.upsert({
            where: { email: student.nim },
            update: {},
            create: {
                email: student.nim,
                password_hash: hashSync(student.nim, 10), // Pass = NIM
                role: Role.MAHASISWA,
                created_by: admin.id
            }
        });

        const mhs = await prisma.student.upsert({
            where: { user_id: user.id },
            update: {
                // Reset for clean slate if re-running logic
                total_sks: 0,
                ipk: 0.00,
                current_semester: CURRENT_SEMESTER
            },
            create: {
                user_id: user.id,
                name: student.name,
                nim_hash: hashNIM(student.nim),
                nim_encrypted: encryptNIM(student.nim),
                batch_year: BATCH_YEAR,
                current_semester: CURRENT_SEMESTER,
                ipk: 0,
                total_sks: 0,
                status: 'AMAN',
                created_by: admin.id
            }
        });

        // 2. Clear existing records for this student to prevent duplicates
        await prisma.academicRecord.deleteMany({ where: { student_id: mhs.id } });

        // 3. Generate History
        let totalPoints = 0;
        let totalSKS = 0;
        let riskStatus = 'AMAN';

        for (let sem = 1; sem <= 4; sem++) {
            const courses = COURSES[sem as keyof typeof COURSES];
            for (const course of courses) {
                const grade = randomGrade();

                await prisma.academicRecord.create({
                    data: {
                        student_id: mhs.id,
                        course_code: course.code,
                        course_name: course.name,
                        sks: course.sks,
                        semester: sem,
                        grade_point: grade
                    }
                });

                totalSKS += course.sks;
                totalPoints += (grade * course.sks);
            }
        }

        // 4. Update Student Metrics
        const ipk = totalSKS > 0 ? (totalPoints / totalSKS) : 0;

        // Check Risk (Simple Logic)
        if (ipk < 2.00) riskStatus = 'KRITIS';
        else if (ipk < 2.75) riskStatus = 'PERLU_PERHATIAN';

        await prisma.student.update({
            where: { id: mhs.id },
            data: {
                total_sks: totalSKS,
                ipk: ipk,
                status: riskStatus
            }
        });

        console.log(`  -> Final IPK: ${ipk.toFixed(2)} | SKS: ${totalSKS} | Status: ${riskStatus}`);
    }

    console.log('Seed completed successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
