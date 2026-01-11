'use server';

import { auth } from '@/auth';
import { studentService, RiskAnalysisResponse } from '@/lib/services/student-service';

/**
 * Server Action to fetch At-Risk Students.
 * Protected: Only accessible by UPM and KAPRODI.
 */
export async function getRiskAnalysisData(
    page: number = 1,
    limit: number = 10,
    threshold: number = 2.75
): Promise<RiskAnalysisResponse | { error: string }> { // Simple error union for now
    const session = await auth();

    // RBAC Check
    if (!session || !session.user || (session.user.role !== 'UPM' && session.user.role !== 'KAPRODI')) {
        return { error: "Unauthorized access" };
    }

    try {
        return await studentService.getAtRiskStudents(threshold, page, limit);
    } catch (error) {
        console.error("[Action] getRiskAnalysisData failed:", error);
        return { error: "Failed to retrieve risk analysis data" };
    }
}

export async function searchStudentAction(query: string) {
    const session = await auth();
    if (!session || (session.user.role !== 'UPM' && session.user.role !== 'KAPRODI')) {
        return { error: "Unauthorized" };
    }

    try {
        // If query is empty, return empty list (or could return top risk)
        if (!query) return [];
        // Defaults to threshold 2.75 for context of "Risk Dashboard" searching
        // but maybe we want to search ALL students? 
        // Let's search ALL for flexiblity, let UI decide to show risk status.
        return await studentService.searchStudents(query);
    } catch (error) {
        console.error("[Action] searchStudentAction failed:", error);
        return { error: "Search failed" };
    }
}
