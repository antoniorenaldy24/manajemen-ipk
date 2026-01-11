"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const db_1 = __importDefault(require("./src/lib/db"));
const transcript_queue_1 = require("./src/lib/queue/transcript-queue");
// Mock Uploader ID (Admin)
const MOCK_ADMIN_ID = "00000000-0000-0000-0000-000000000000"; // Assuming UUID format required? 
// DB Uuid might require valid UUID. Let's try to get a valid one or use a dummy valid UUID.
const VALID_UUID = "5300f912-2e45-4228-ae2d-327329596541";
async function testStorageFlow() {
    console.log("--- Starting Storage Integration Test ---");
    // 0. Ensure no conflict (Cleanup previous test data if any - optional but good)
    // For safety, we use a unique NIM for testing to avoid unique constraint clashes with seed data
    const TEST_NIM = "99999999";
    // 1. Create Dummy Excel with Unique Data
    const wb = XLSX.utils.book_new();
    const data = [
        { "NIM": TEST_NIM, "NAMA": "Integration Test Student", "KODE_MK": "TEST101", "SKS": 3, "NILAI_HURUF": "A" },
        { "NIM": TEST_NIM, "NAMA": "Integration Test Student", "KODE_MK": "TEST102", "SKS": 4, "NILAI_HURUF": "B" }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const base64Buffer = buffer.toString('base64');
    // 2. Setup Worker
    console.log("Setting up worker...");
    const worker = (0, transcript_queue_1.createTranscriptWorker)();
    worker.on('completed', async (job) => {
        console.log(`[TEST] Job ${job.id} COMPLETED.`);
        try {
            // 3. Verify Database
            console.log("Verifying Database Content...");
            // Check User/Student Creation
            const student = await db_1.default.student.findFirst({
                where: { name: "Integration Test Student" },
                include: { academic_records: true, user: true }
            });
            if (!student)
                throw new Error("Student was not created in DB!");
            console.log("Student Found:", student.name, student.nim_encrypted);
            // Check Decryption
            // We can't easily check 'nim_hash' without hashing again, but we check 'user.email'
            if (student.user.email !== TEST_NIM)
                throw new Error(`User email mismatch. Got ${student.user.email}, expected ${TEST_NIM}`);
            // Check Records
            console.log("Academic Records:", student.academic_records.length);
            if (student.academic_records.length !== 2)
                throw new Error("Expected 2 academic records");
            const r1 = student.academic_records.find(r => r.course_code === 'TEST101');
            // A = 4.0
            if (!r1 || Number(r1.grade_point) !== 4.0)
                throw new Error(`Record TEST101 incorrect. Grade: ${r1 === null || r1 === void 0 ? void 0 : r1.grade_point}`);
            console.log("--- Storage Test PASSED ---");
            process.exit(0);
        }
        catch (e) {
            console.error("Verification Failed:", e);
            process.exit(1);
        }
    });
    worker.on('failed', (job, err) => {
        console.error(`[TEST] Job ${job === null || job === void 0 ? void 0 : job.id} FAILED execution:`, err);
        process.exit(1);
    });
    // 3. Add Job
    console.log(`Adding job for NIM ${TEST_NIM}...`);
    await (0, transcript_queue_1.addTranscriptJob)({
        fileBufferBase64: base64Buffer,
        fileName: 'integration-test.xlsx',
        uploadedBy: VALID_UUID
    });
}
testStorageFlow().catch(err => {
    console.error("Test Script Error:", err);
    process.exit(1);
});
