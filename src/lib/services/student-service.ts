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
    async getAtRiskStudents(threshold: number, page: number = 1, limit: number = 10, semester?: number): Promise<RiskAnalysisResponse> {
        const offset = (page - 1) * limit;

        // 1. Query MV for high-level filtering (IDs & IPK)
        // With optional semester filter.

        let countQuery = `
            SELECT COUNT(*) as count 
            FROM "mv_student_risk" 
            WHERE ipk < ${threshold}
        `;

        if (semester) {
            countQuery += ` AND current_semester = ${semester}`;
        }

        // Use proper Prisma raw query (Template literals are safer but dynamic construction requires care or helpers)
        // For simplicity with Prisma raw, we can use distinct queries or conditions.
        // Prisma.sql`` handles SQL injection if we pass variables. 
        // For dynamic "AND", it's slightly trickier with raw template literals. 
        // Let's use simple conditional logic for the query.

        // Note: Prisma QueryRaw requires template literal tagging for safety.
        // We will branch since we only have one optional filter.

        let countResult;
        let riskRows;

        if (semester) {
            countResult = await prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(*) as count 
                FROM "mv_student_risk" 
                WHERE ipk < ${threshold} AND current_semester = ${semester}
            `;

            riskRows = await prisma.$queryRaw<{ id: string, ipk: number }[]>`
                SELECT id, ipk 
                FROM "mv_student_risk" 
                WHERE ipk < ${threshold} AND current_semester = ${semester}
                ORDER BY ipk ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
        } else {
            countResult = await prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(*) as count 
                FROM "mv_student_risk" 
                WHERE ipk < ${threshold}
            `;

            riskRows = await prisma.$queryRaw<{ id: string, ipk: number }[]>`
                SELECT id, ipk 
                FROM "mv_student_risk" 
                WHERE ipk < ${threshold}
                ORDER BY ipk ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
        }

        const total = Number(countResult[0]?.count || 0);

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
                ipk: true
            }
        });

        // Map back to preserve sort order from MV
        const studentMap = new Map(students.map(s => [s.id, s]));

        // 3. Transformation & Decryption
        const processedData: StudentRiskData[] = riskRows.map(row => {
            const details = studentMap.get(row.id);
            if (!details) return null;

            const ipkVal = Number(details.ipk);
            let status: RiskStatus = 'AMAN';
            if (ipkVal < 2.00) status = 'KRITIS';
            else if (ipkVal < 2.75) status = 'WASPADA';

            return {
                id: details.id,
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    /**
     * Retrieves ALL students considered "At Risk" for reporting purposes (No Pagination).
     */
    async getAllAtRiskStudents(threshold: number, semester?: number): Promise<StudentRiskData[]> {
        // 1. Query MV
        let query = `
            SELECT id, ipk 
            FROM "mv_student_risk" 
            WHERE ipk < ${threshold}
        `;

        if (semester) {
            query += ` AND current_semester = ${semester}`;
        }

        query += ` ORDER BY ipk ASC`;

        const riskRows = await prisma.$queryRawUnsafe<{ id: string, ipk: number }[]>(query);

        if (riskRows.length === 0) return [];

        const studentIds = riskRows.map(r => r.id);

        // 2. Fetch Details
        const students = await prisma.student.findMany({
            where: { id: { in: studentIds } },
            select: {
                id: true,
                nim_encrypted: true,
                name: true,
                total_sks: true,
                current_semester: true,
                ipk: true
            }
        });

        const studentMap = new Map(students.map(s => [s.id, s]));

        // 3. Transform
        return riskRows.map(row => {
            const details = studentMap.get(row.id);
            if (!details) return null;

            const ipkVal = Number(details.ipk);
            let status: RiskStatus = 'AMAN';
            if (ipkVal < 2.00) status = 'KRITIS';
            else if (ipkVal < 2.75) status = 'WASPADA';

            return {
                id: details.id,
                nim: decryptNIM(details.nim_encrypted),
                name: details.name,
                ipk: ipkVal,
                total_sks: details.total_sks,
                semester: details.current_semester,
                risk_status: status
            };
        }).filter(item => item !== null) as StudentRiskData[];
    }
}

export const studentService = new StudentService();
