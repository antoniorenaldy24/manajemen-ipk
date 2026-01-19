import prisma from '../db';
import { Role } from '@prisma/client';
import { prepareUserCredentials } from '../logic/credential-utils';

interface MappedTranscriptRecord {
    nim_hash: string;
    nim_encrypted: string;
    student_name: string;
    course_code: string;
    course_name?: string;
    sks: number;
    grade_letter: string;
    grade_point: number;
    semester_taken?: number;
    original_nim?: string;
}

export class TranscriptService {

    /**
     * Saves a list of mapped transcript records.
     */
    async saveTranscriptData(records: MappedTranscriptRecord[], uploadedByUserId: string) {
        if (!records.length) return;
        console.log(`[Service] Saving ${records.length} records...`);

        const recordsByStudent = new Map<string, MappedTranscriptRecord[]>();
        for (const record of records) {
            const key = record.nim_hash;
            if (!recordsByStudent.has(key)) recordsByStudent.set(key, []);
            recordsByStudent.get(key)?.push(record);
        }

        for (const [nimHash, studentRecords] of recordsByStudent) {
            const representative = studentRecords[0];
            try {
                const student = await this.ensureStudentExists(representative, uploadedByUserId);

                await prisma.$transaction(
                    studentRecords.map(record => {
                        return prisma.academicRecord.create({
                            data: {
                                student_id: student.id,
                                course_code: record.course_code.substring(0, 50),
                                course_name: record.course_name ? record.course_name.substring(0, 255) : "",
                                sks: record.sks,
                                // PRIORITY: Excel Column -> Existing Student Current Semester -> Default 1
                                semester: record.semester_taken ?? student.current_semester ?? 1,
                                grade_point: record.grade_point,
                            }
                        });
                    })
                );

                // Trigger IPK Calculation
                await this.calculateStudentIPK(student.id);

            } catch (err) {
                console.error(`[Service] Error processing student ${representative.nim_hash.substring(0, 8)}...`, err);
            }
        }
        console.log(`[Service] Save complete.`);
    }

    /**
     * Calculates and updates the IPK (GPA) for a student.
     * Formula: Sum(GradePoint * SKS) / Sum(SKS)
     */
    async calculateStudentIPK(studentId: string) {
        const records = await prisma.academicRecord.findMany({
            where: { student_id: studentId },
            select: { grade_point: true, sks: true }
        });

        if (records.length === 0) return;

        let totalPoints = 0;
        let totalSks = 0;

        for (const rec of records) {
            totalPoints += (Number(rec.grade_point) * rec.sks);
            totalSks += rec.sks;
        }

        const ipk = totalSks > 0 ? (totalPoints / totalSks) : 0;

        await prisma.student.update({
            where: { id: studentId },
            data: {
                ipk: Number(ipk.toFixed(2)),
                total_sks: totalSks
            }
        });
    }

    private getSemesterFromBatch(batchYear: number): number {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11 (Jan=0, Feb=1)

        // Academic Year starts in August (Month 7)
        // Sem 1: Aug - Jan
        // Sem 2: Feb - Jul

        let yearsDiff = currentYear - batchYear;

        // If we are in Jan/Feb (Month < 7), we are technically in the "Even" semester of the prev year OR "Odd" semester end of current academic year?
        // Wait, Jan is still Ganjil (Odd). Feb starts Genap (Even).

        // Example: Batch 2023.
        // Jan 2026. Diff = 3.
        // Semesters passed:
        // 2023/2024: 1, 2
        // 2024/2025: 3, 4
        // 2025/2026: 5 (Aug 25 - Jan 26), 6 (Feb 26 - Jul 26)

        // Base calculation:
        let semester = yearsDiff * 2;

        // Adjust for month
        if (currentMonth >= 7) {
            // Aug - Dec: Start of new academic year -> Odd Semester
            semester += 1;
        } else {
            // Jan - Jul:
            if (currentMonth === 0) {
                // January: End of Odd Semester
                semester -= 1;
            } else {
                // Feb - Jul: Even Semester
                // default is correct?
                // 2026 - 2023 = 3 -> * 2 = 6.
                // Feb 2026 is Sem 6. Correct.
            }
        }

        return semester > 0 ? semester : 1;
    }

    private async ensureStudentExists(record: MappedTranscriptRecord, uploaderId: string): Promise<{ id: string, current_semester: number }> {
        // 1. Try to find student by Secure Hash
        const existingStudent = await prisma.student.findUnique({
            where: { nim_hash: record.nim_hash },
            select: { id: true, current_semester: true }
        });

        if (existingStudent) return existingStudent;

        // Decrypt NIM to generate Email credentials
        const { email, passwordHash } = prepareUserCredentials(record.nim_encrypted);

        // Infer Batch Year from decrypted NIM (Assuming format 23xxxxx -> 2023)
        // Decrypted NIM is available in record.nim_encrypted? No, that's encrypted.
        // record doesn't have plain NIM.
        // We need to pass plain NIM or extract it?
        // Wait, transcript-mapper passes encrypted, but we decrypt it for credential generation anyway.
        // prepareUserCredentials decrypts it internally? No, checks:
        // Let's check prepareUserCredentials usage. 
        // Ah, `transcript-mapper` has `nim_encrypted = encryptNIM(nimStr)`.
        // We cannot easily get plaintext here unless we decipher it again.

        // However, `prepareUserCredentials` usually DECIPHERS or we pass plaintext?
        // Let's check `credential-utils`. 
        // Assuming we decrypt it:
        const { decryptNIM } = await import('../security/crypto');
        const plainNIM = decryptNIM(record.nim_encrypted);
        const batchPrefix = plainNIM.substring(0, 2);
        const batchYear = 2000 + parseInt(batchPrefix); // 23 -> 2023

        const calculatedSemester = this.getSemesterFromBatch(batchYear);

        const result = await prisma.$transaction(async (tx) => {
            // 2. Check if User already exists
            let userId: string;

            const existingUser = await tx.user.findUnique({
                where: { email: email }
            });

            if (existingUser) {
                userId = existingUser.id;
            } else {
                const newUser = await tx.user.create({
                    data: {
                        email: email,
                        password_hash: passwordHash,
                        role: Role.MAHASISWA,
                        created_by: uploaderId
                    }
                });
                userId = newUser.id;
            }

            // 3. Create Student Record
            const newStudent = await tx.student.create({
                data: {
                    user_id: userId,
                    nim_hash: record.nim_hash,
                    nim_encrypted: record.nim_encrypted,
                    name: record.student_name,
                    batch_year: batchYear,
                    current_semester: calculatedSemester,
                    created_by: uploaderId,
                    ipk: 0,
                    total_sks: 0
                }
            });
            return newStudent;
        });

        return { id: result.id, current_semester: result.current_semester };
    }
}

export const transcriptService = new TranscriptService();
