
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { decryptNIM, encryptNIM } from '../src/lib/security/crypto';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
    connectionString: connectionString.includes('sslmode') ? connectionString.split('?')[0] : connectionString,
    ssl: { rejectUnauthorized: false }
}); // Force SSL for specific user env
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting Risk Data Update...");

    // 1. Identify Target Students - BYPASS ENCRYPTION MATCHING
    // Just pick the last 2 students to be the "victims"
    const allStudents = await prisma.student.findMany();

    if (allStudents.length < 2) {
        console.log("Not enough students to update.");
        return;
    }

    // Pick last 2
    const targets = allStudents.slice(-2);

    for (const student of targets) {
        console.log(`Updating ${student.name} to be AT RISK...`); // removed decrypted NIM log

        // 2. Destroy their grades for Semester 4 (Make them fail hard to lower IPK)
        // Set most grades to D (1.0) or E (0.0)

        // Fetch their records
        const records = await prisma.academicRecord.findMany({
            where: { student_id: student.id, semester: 4 }
        });

        for (const record of records) {
            await prisma.academicRecord.update({
                where: { id: record.id },
                data: {
                    grade_point: 1.00 // D
                }
            });
        }

        // Also add one 'E' (Fail)
        if (records.length > 0) {
            await prisma.academicRecord.update({
                where: { id: records[0].id },
                data: { grade_point: 0.00 }
            });
        }

        // 3. Re-calculate IPK
        const allRecords = await prisma.academicRecord.findMany({
            where: { student_id: student.id }
        });

        let totalPoints = 0;
        let totalSKS = 0;

        for (const r of allRecords) {
            totalPoints += Number(r.grade_point) * r.sks;
            totalSKS += r.sks;
        }

        const newIPK = totalSKS > 0 ? (totalPoints / totalSKS) : 0;

        console.log(`  -> New IPK: ${newIPK.toFixed(2)}`);

        // 4. Update Student
        await prisma.student.update({
            where: { id: student.id },
            data: {
                ipk: newIPK,
                status: newIPK < 2.0 ? 'KRITIS' : 'WASPADA'
            }
        });
    }

    // 5. REFRESH MATERIALIZED VIEW
    console.log("Refreshing Course Stats View...");
    try {
        await prisma.$executeRaw`REFRESH MATERIALIZED VIEW mv_course_stats`;
        console.log("mv_course_stats Refreshed Successfully.");
    } catch (e) {
        console.error("Failed to refresh mv_course_stats:", e);
    }

    console.log("Refreshing Student Risk View...");
    try {
        await prisma.$executeRaw`REFRESH MATERIALIZED VIEW mv_student_risk`;
        console.log("mv_student_risk Refreshed Successfully.");
    } catch (e) {
        console.error("Failed to refresh mv_student_risk (It might not exist or is a table?):", e);
    }

    console.log("Update Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
