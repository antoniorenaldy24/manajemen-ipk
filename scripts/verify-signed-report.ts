
import 'dotenv/config';
import { IntegrityService } from '../src/lib/services/integrity-service';
import { ReportGenerator } from '../src/lib/services/report-generator';
import prisma from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log("--- Testing Digital Signature (QR) Flow ---");

    // 1. Setup User
    const user = await prisma.user.findFirst();
    if (!user) { console.error("No user found."); return; }

    const dummyData = [
        { nim: '12345', name: 'Alice (Signed)', ipk: 3.55, status: 'AMAN' },
        { nim: '67890', name: 'Bob (Signed)', ipk: 2.10, status: 'WASPADA' }
    ];

    // 2. Step 1: Init Log
    console.log("1. Initializing Report Log...");
    const reportId = await IntegrityService.initReportLog(
        user.id,
        "SIGNED_PDF_TEST",
        "PDF",
        { signed: true }
    );
    console.log(`   -> Report ID: ${reportId}`);

    // 3. Step 2: Generate PDF with QR using Report ID
    console.log("2. Generating PDF with QR...");
    const verificationUrl = `https://portal-ipk.univ.ac.id/verify/${reportId}`;
    console.log(`   -> QR Content: ${verificationUrl}`);

    const pdfBuffer = await ReportGenerator.generatePDFReport(
        "Laporan Resmi (Signed)",
        dummyData,
        ['nim', 'name', 'ipk', 'status'],
        verificationUrl // <-- Injecting QR Data
    );

    // 4. Step 3: Finalize Hash
    console.log("3. Finalizing Hash...");
    await IntegrityService.finalizeReportLog(reportId, pdfBuffer);

    // Save for inspection
    const outPath = path.join(process.cwd(), 'signed_report.pdf');
    fs.writeFileSync(outPath, pdfBuffer);
    console.log(`   -> Saved to: ${outPath}`);

    // 5. Verification Check
    console.log("4. verifying Integrity...");
    const check = await IntegrityService.verifyReportIntegrity(reportId, pdfBuffer);
    if (check.isValid) {
        console.log("   -> SUCCESS: Signed Report Integirty Valid.");
    } else {
        console.error("   -> FAIL: Integrity Mismatch!");
    }

    console.log("--- Flow Complete ---");
}

main().catch(console.error).finally(() => prisma.$disconnect());
