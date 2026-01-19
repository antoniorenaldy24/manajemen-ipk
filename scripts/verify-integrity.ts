
import 'dotenv/config';
import { IntegrityService } from '../src/lib/services/integrity-service';
import prisma from '../src/lib/db';
import * as fs from 'fs';

async function main() {
    console.log("--- Testing Data Integrity Validation ---");

    // 1. Setup Dummy User (Need a valid User ID)
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found to test.");
        return;
    }

    // 2. Simulate Report Generation
    const dummyContent = "This is a strictly valid report content.";
    const buffer = Buffer.from(dummyContent, 'utf-8');

    console.log("Logging Report...");
    const log = await IntegrityService.logReportGeneration(
        user.id,
        "TEST_INTEGRITY",
        "PDF",
        { test: true },
        buffer
    );
    console.log(` -> Report Logged. ID: ${log.id}`);
    console.log(` -> Hash: ${log.file_hash}`);

    // 3. Verify Original (Should Pass)
    console.log("Verifying Original...");
    const check1 = await IntegrityService.verifyReportIntegrity(log.id, buffer);
    if (check1.isValid) {
        console.log(" -> SUCCESS: Integrity Valid.");
    } else {
        console.error(" -> FAIL: Integrity Check Failed!");
    }

    // 4. Simulate Tampering (Should Fail)
    console.log("Verifying Tampered File...");
    const tamperedBuffer = Buffer.from(dummyContent + " (Modified)", 'utf-8');
    const check2 = await IntegrityService.verifyReportIntegrity(log.id, tamperedBuffer);

    if (!check2.isValid) {
        console.log(" -> SUCCESS: Tampering Detected.");
        console.log(`    Expected: ${check2.storedHash}`);
        console.log(`    Got:      ${check2.computedHash}`);
    } else {
        console.error(" -> FAIL: Tampering NOT Detected!");
    }

    console.log("--- Test Complete ---");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
