"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcriptService = exports.TranscriptService = void 0;
const db_1 = __importDefault(require("../db"));
const client_1 = require("@prisma/client");
const credential_utils_1 = require("../logic/credential-utils");
class TranscriptService {
    /**
     * Saves a list of mapped transcript records.
     */
    async saveTranscriptData(records, uploadedByUserId) {
        var _a;
        if (!records.length)
            return;
        console.log(`[Service] Saving ${records.length} records...`);
        const recordsByStudent = new Map();
        for (const record of records) {
            const key = record.nim_hash;
            if (!recordsByStudent.has(key))
                recordsByStudent.set(key, []);
            (_a = recordsByStudent.get(key)) === null || _a === void 0 ? void 0 : _a.push(record);
        }
        for (const [nimHash, studentRecords] of recordsByStudent) {
            const representative = studentRecords[0];
            try {
                const studentId = await this.ensureStudentExists(representative, uploadedByUserId);
                await db_1.default.$transaction(studentRecords.map(record => {
                    return db_1.default.academicRecord.create({
                        data: {
                            student_id: studentId,
                            course_code: record.course_code.substring(0, 50),
                            semester: record.semester_taken || 1,
                            grade_point: record.grade_point,
                        }
                    });
                }));
            }
            catch (err) {
                console.error(`[Service] Error processing student ${representative.nim_hash.substring(0, 8)}...`, err);
            }
        }
        console.log(`[Service] Save complete.`);
    }
    async ensureStudentExists(record, uploaderId) {
        const existingStudent = await db_1.default.student.findUnique({
            where: { nim_hash: record.nim_hash },
            select: { id: true }
        });
        if (existingStudent)
            return existingStudent.id;
        // Decrypt NIM for User creation using helper
        const { email, passwordHash } = (0, credential_utils_1.prepareUserCredentials)(record.nim_encrypted);
        const result = await db_1.default.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: email,
                    password_hash: passwordHash,
                    role: client_1.Role.MAHASISWA,
                    created_by: uploaderId
                }
            });
            const newStudent = await tx.student.create({
                data: {
                    user_id: newUser.id,
                    nim_hash: record.nim_hash,
                    nim_encrypted: record.nim_encrypted,
                    name: record.student_name,
                    batch_year: 2020,
                    current_semester: 1,
                    created_by: uploaderId
                }
            });
            return newStudent;
        });
        return result.id;
    }
}
exports.TranscriptService = TranscriptService;
exports.transcriptService = new TranscriptService();
