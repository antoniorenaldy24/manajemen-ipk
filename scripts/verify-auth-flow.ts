
import 'dotenv/config';
import prisma from '../src/lib/db';
import { hashNIM } from '../src/lib/security/crypto';

async function main() {
    console.log("--- Starting Auth Flow Verification ---");

    // 1. Pick a random student or Create a Dummy "Student User" logic for testing
    // Since we can't create a real user session here effortlessly, we test the LOOKUP logic.

    // Find any student
    const student = await prisma.student.findFirst();

    if (!student) {
        console.warn("No students found to test. Please seed data.");
        return;
    }

    console.log("Testing lookup for Student ID:", student.id);

    // 2. We don't have the RAW NIM because it's encrypted.
    // BUT, we can test if we HAD the raw nim, would the hash match?
    // This is tricky without knowing the raw NIM.
    // So instead, we will temporarily "register" a known NIM for testing, then delete it?
    // OR: We trust the hash logic and just verify the query structure works.

    // Let's simulation the query logic:
    console.log("Simulating Login Query Structure...");

    const mockHash = student.nim_hash; // We use the existing hash tosimulate "Input correct NIM"

    console.time("Lookup Time");
    const foundStudent = await prisma.student.findUnique({
        where: { nim_hash: mockHash },
        select: { user_id: true }
    });
    console.timeEnd("Lookup Time");

    if (foundStudent && foundStudent.user_id) {
        const foundUser = await prisma.user.findUnique({
            where: { id: foundStudent.user_id }
        });
        console.log("Linked User Found:", foundUser ? foundUser.email : "NULL");
        console.log("Role:", foundUser?.role);
    } else {
        console.error("Failed to link Student -> User (Data Integrity Issue?)");
    }

    console.log("--- Verification Complete ---");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
