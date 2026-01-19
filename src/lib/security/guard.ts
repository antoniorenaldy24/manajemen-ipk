
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export class SecurityGuard {

    /**
     * Verifies that the current session user owns the target student data.
     * Throws error or redirects if verification fails.
     * 
     * Rules:
     * - Admin/UPM/KAPRODI: Allowed (Can view all students).
     * - MAHASISWA: Allowed ONLY if user.id is linked to the targetStudentId.
     * 
     * @param targetStudentId The UUID of the student record being accessed.
     */
    static async verifyStudentOwnership(targetStudentId: string) {
        const session = await auth();

        if (!session || !session.user) {
            throw new Error("Unauthorized: No active session");
        }

        const role = session.user.role;
        const userId = session.user.id;

        // 1. Staff Roles - Bypass Ownership Check
        if (role === 'UPM' || role === 'KAPRODI' || role === 'ADMIN') {
            return true;
        }

        // 2. Student Role - Strict Ownership Check
        if (role === 'MAHASISWA') {
            // Check if the current user is linked to the target student
            const student = await prisma.student.findUnique({
                where: { id: targetStudentId },
                select: { user_id: true }
            });

            if (!student) {
                // Student record not found at all
                throw new Error("Resource not found");
            }

            if (student.user_id !== userId) {
                console.warn(`[Security] Ownership Violation: User ${userId} tried to access Student ${targetStudentId}`);
                // Throwing specific error usually better, but for Next.js actions/pages, redirect often triggers boundaries
                throw new Error("Forbidden: You do not own this data.");
            }

            return true;
        }

        // Default Deny
        throw new Error("Forbidden: Unknown Role");
    }

    /**
     * Returns the Student ID for the current logged-in user.
     * Useful for redirecting student to their own profile.
     */
    static async getCurrentStudentId(): Promise<string | null> {
        const session = await auth();
        if (!session?.user?.id) return null;

        const student = await prisma.student.findFirst({
            where: { user_id: session.user.id },
            select: { id: true }
        });

        return student?.id || null;
    }
}
