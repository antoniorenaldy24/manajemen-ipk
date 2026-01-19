
import 'dotenv/config';
import { studentService } from '../src/lib/services/student-service';
import prisma from '../src/lib/db';

async function main() {
    console.log("--- Starting Risk Filter Verification ---");

    // 1. Refresh MV to ensure data is up to date (optional, but good practice)
    console.log("Refreshing Materialized View...");
    try {
        await prisma.$executeRaw`REFRESH MATERIALIZED VIEW "mv_student_risk"`;
    } catch (e) {
        console.warn("Could not refresh MV (might not exist yet or permissions):", e);
    }

    // 2. Test without semester filter
    console.log("\nTesting Risk Filter (No Semester)...");
    const result1 = await studentService.getAtRiskStudents(3.00, 1, 5);
    console.log(`Found ${result1.meta.total} students at risk (< 3.00).`);
    result1.data.forEach(s => console.log(` - ${s.name} (Sem ${s.semester}): IPK ${s.ipk}`));

    // 3. Test with semester filter (Pick a semester that exists in result1)
    if (result1.data.length > 0) {
        const targetSem = result1.data[0].semester;
        console.log(`\nTesting Risk Filter (Semester ${targetSem})...`);
        const result2 = await studentService.getAtRiskStudents(3.00, 1, 5, targetSem);
        console.log(`Found ${result2.meta.total} students in Semester ${targetSem}.`);

        result2.data.forEach(s => {
            console.log(` - ${s.name} (Sem ${s.semester}): IPK ${s.ipk}`);
            if (s.semester !== targetSem) {
                console.error("ERROR: Found student from wrong semester!");
            }
        });
    } else {
        console.log("No data to test semester filter.");
    }

    console.log("\n--- Verification Complete ---");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
