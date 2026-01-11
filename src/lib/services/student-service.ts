import prisma from '../db';
import { decryptNIM, hashNIM } from '../security/crypto';


export type RiskStatus = 'KRITIS' | 'WASPADA' | 'AMAN';

export interface StudentRiskData {
    id: string;
    nim: string;
    name: string;
    ipk: number;
    total_sks: number;
    semester: number;
    risk_status: RiskStatus;
}

export interface RiskAnalysisResponse {
    meta: {
        page: number;
        limit: number;
        total: number;
        threshold: number;
    };
    data: StudentRiskData[];
}

export class StudentService {

    /**
     * Retrieves students considered "At Risk" based on IPK threshold.
     * Uses Materialized View 'mv_student_risk' for performant filtering.
     * 
     * @param threshold - IPK cut-off (e.g., 2.75)
     * @param page - Pagination page (1-indexed)
     * @param limit - Pagination limit
     */
    async getAtRiskStudents(threshold: number, page: number = 1, limit: number = 10): Promise<RiskAnalysisResponse> {
        const offset = (page - 1) * limit;

        // 1. Query MV for high-level filtering (IDs & IPK)
        // Note: Prisma $queryRaw returns generic objects.
        // We cast to expected shape. 
        // Logic: Filter by threshold, sort by IPK ASC (Lowest first - Critical)

        // We also need total count for pagination metadata. 
        // Doing two queries: Count and Data.

        const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count 
            FROM "mv_student_risk" 
            WHERE ipk < ${threshold}
        `;

        const total = Number(countResult[0]?.count || 0);

        const riskRows = await prisma.$queryRaw<{ id: string, ipk: number }[]>`
            SELECT id, ipk 
            FROM "mv_student_risk" 
            WHERE ipk < ${threshold}
            ORDER BY ipk ASC
            LIMIT ${limit} OFFSET ${offset}
        `;

        if (riskRows.length === 0) {
            return {
                meta: { page, limit, total, threshold },
                data: []
            };
        }

        const studentIds = riskRows.map(r => r.id);

        // 2. Data Enrichment (Fetch Details from Main Table)
        const students = await prisma.student.findMany({
            where: { id: { in: studentIds } },
            select: {
                id: true,
                nim_encrypted: true,
                name: true,
                total_sks: true,
                current_semester: true,
                // We use the IPK from the main table which is synced with MV naturally 
                // (or strictly use MV's IPK if MV refresh lag is a concern, but usually main table is source of truth)
                ipk: true
            }
        });

        // Map back to preserve sort order from MV (Lowest IPK first)
        const studentMap = new Map(students.map(s => [s.id, s]));

        // 3. Transformation & Decryption
        const processedData: StudentRiskData[] = riskRows.map(row => {
            const details = studentMap.get(row.id);
            if (!details) return null; // Should not happen given FK constraint

            // Handling Nulls/Zero SKS
            // If SKS is 0, IPK is 0. This is technically "Critical" but might be "New Student".
            // We verify logical status. 
            // Standard: If IPK < 2.00 -> KRITIS. If 2.00 <= IPK < 2.75 -> WASPADA.

            const ipkVal = Number(details.ipk);
            let status: RiskStatus = 'AMAN';
            if (ipkVal < 2.00) status = 'KRITIS';
            else if (ipkVal < 2.75) status = 'WASPADA';

            // Special case logic could be added here (e.g. SKS=0 => "BELUM ADA DATA" or "KRITIS")
            // Strict interpretation: 0 is < 2.00, so KRITIS.

            return {
                id: details.id,
                // Decrypt NIM on the fly
                nim: decryptNIM(details.nim_encrypted),
                name: details.name,
                ipk: ipkVal,
                total_sks: details.total_sks,
                semester: details.current_semester,
                risk_status: status
            };
        }).filter(item => item !== null) as StudentRiskData[];

        return {
            meta: { page, limit, total, threshold },
            data: processedData
        };
    }

    /**
     * Searches for students, optionally filtering by IPK threshold.
     */
    async searchStudents(query: string, threshold?: number): Promise<StudentRiskData[]> {
        let whereClause: any = {
            deleted_at: null,
        };

        if (threshold) {
            whereClause.ipk = { lt: threshold };
        }

        // Determine if query is Name or NIM
        // Simple heuristic: if query contains letters, it's likely a name (or mixed). 
        // If strictly digits, it might be NIM. But users might type partial NIM.
        // Blind Index (Hash) ONLY works for EXACT match. 
        // For partial NIM search, we cannot use the hash. We would need a separate partial index or decrypt all (too slow).
        // OR we just support Name search and Exact NIM search.

        const cleanQuery = query.trim();
        const isDigits = /^\d+$/.test(cleanQuery);

        if (isDigits && cleanQuery.length >= 5) {
            // Try Hash for Exact Match candidate
            whereClause.nim_hash = hashNIM(cleanQuery);
        } else {
            // Name search
            whereClause.name = { contains: cleanQuery, mode: 'insensitive' };
        }

        // If it was digit but short, maybe it's just a funny name or user trying partial. 
        // If we strictly enforce Blind Index, we can't do partial NIM. 
        // Let's fallback to name search if hash not used, or combined.
        // Actually, let's keep it simple: Name contains OR Exact NIM.

        if (!whereClause.nim_hash && !whereClause.name) {
            whereClause.name = { contains: cleanQuery, mode: 'insensitive' };
        }

        const students = await prisma.student.findMany({
            where: whereClause,
            take: 20,
            orderBy: { ipk: 'asc' }
        });

        return students.map(s => {
            const ipkVal = Number(s.ipk);
            let status: RiskStatus = 'AMAN';
            if (ipkVal < 2.00) status = 'KRITIS';
            else if (ipkVal < 2.75) status = 'WASPADA';

            return {
                id: s.id,
                nim: decryptNIM(s.nim_encrypted),
                name: s.name,
                ipk: ipkVal,
                total_sks: s.total_sks,
                semester: s.current_semester,
                risk_status: status
            };
        });
    }
}

export const studentService = new StudentService();
