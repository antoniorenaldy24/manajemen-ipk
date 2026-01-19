
'use server';

import { auth } from "@/auth";
import { studentService } from "@/lib/services/student-service";
import { IntegrityService } from "@/lib/services/integrity-service";
import { ReportGenerator } from "@/lib/services/report-generator";

export type ReportResult = {
    success: boolean;
    data?: string; // Base64
    filename?: string;
    error?: string;
};

export async function generateRiskReportAction(threshold: number = 2.75): Promise<ReportResult> {
    try {
        const session = await auth();
        if (!session || !session.user || (session.user.role !== 'UPM' && session.user.role !== 'KAPRODI')) {
            throw new Error("Unauthorized: Insufficient permissions.");
        }

        // 1. Fetch Data
        const students = await studentService.getAllAtRiskStudents(threshold);
        if (students.length === 0) {
            return { success: false, error: "No data found matching criteria." };
        }

        // 2. Init Report Log (Integrity) - "PENDING"
        const reportId = await IntegrityService.initReportLog(
            session.user.id,
            "RISK_ASSESSMENT",
            "PDF",
            { threshold }
        );

        // 3. Generate PDF with QR Code (Signature)
        // QR Content: Link to verify this specific report ID
        // Assuming base URL is configured env or hardcoded for now
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portal-ipk.univ.ac.id";
        const verificationUrl = `${baseUrl}/verify/${reportId}`;

        const buffer = await ReportGenerator.generatePDFReport(
            "Laporan Mahasiswa Beresiko",
            students,
            ['nim', 'name', 'ipk', 'risk_status', 'semester', 'total_sks'],
            verificationUrl
        );

        // 4. Finalize Report Log (Hash & Sign) - "COMPLETED"
        await IntegrityService.finalizeReportLog(reportId, buffer);

        // 5. Return as Base64 for Client Download
        const base64 = buffer.toString('base64');
        const filename = `Laporan_Resiko_${new Date().toISOString().split('T')[0]}.pdf`;

        return { success: true, data: base64, filename };

    } catch (error: any) {
        console.error("Report Gen Error:", error);
        return { success: false, error: error.message };
    }
}
