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
                const studentId = await this.ensureStudentExists(representative, uploadedByUserId);

                await prisma.$transaction(
                    studentRecords.map(record => {
                        return prisma.academicRecord.create({
                            data: {
                                student_id: studentId,
                                course_code: record.course_code.substring(0, 50),
                                course_name: record.course_name ? record.course_name.substring(0, 255) : "",
                                sks: record.sks,
                                semester: record.semester_taken || 1,
                                grade_point: record.grade_point,
                            }
                        });
                    })
                );

                // Trigger IPK Calculation
                await this.calculateStudentIPK(studentId);

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

        console.log(`[Service] Updated IPK for student ${studentId}: ${ipk.toFixed(2)} (SKS: ${totalSks})`);
    }

    private async ensureStudentExists(record: MappedTranscriptRecord, uploaderId: string): Promise<string> {
        // 1. Try to find student by Secure Hash
        const existingStudent = await prisma.student.findUnique({
            where: { nim_hash: record.nim_hash },
            select: { id: true }
        });

        if (existingStudent) return existingStudent.id;

        // Decrypt NIM to generate Email credentials
        const { email, passwordHash } = prepareUserCredentials(record.nim_encrypted);

        const result = await prisma.$transaction(async (tx) => {
            // 2. Check if User already exists (e.g. from previous hash strategy or manual creation)
            let userId: string;

            const existingUser = await tx.user.findUnique({
                where: { email: email }
            });

            if (existingUser) {
                console.log(`[Service] User ${email} exists. Linking new student record...`);
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

            // 3. Create Student Record linked to User
            const newStudent = await tx.student.create({
                data: {
                    user_id: userId,
                    nim_hash: record.nim_hash,
                    nim_encrypted: record.nim_encrypted,
                    name: record.student_name,
                    batch_year: 2020, // Todo: extracting batch from NIM logic if needed
                    current_semester: 1,
                    created_by: uploaderId,
                    ipk: 0,
                    total_sks: 0
                }
            });
            return newStudent;
        });

        return result.id;
    }
}

export const transcriptService = new TranscriptService();
