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
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const transcript_parser_1 = require("./src/lib/parser/transcript-parser");
const transcript_queue_1 = require("./src/lib/queue/transcript-queue");
async function testIntegration() {
    console.log("--- Starting Integration Test ---");
    // 1. Create Dummy Excel
    const wb = XLSX.utils.book_new();
    const headers = ["No", "Kode Mata Kuliah", "Nama Mata Kuliah", "SKS", "Nilai Angka", "Nilai Huruf"];
    const data = [
        { "No": 1, "Kode Mata Kuliah": "TI001", "Nama Mata Kuliah": "Algoritma", "SKS": 3, "Nilai Angka": 85, "Nilai Huruf": "A" },
        { "No": 2, "Kode Mata Kuliah": "TI002", "Nama Mata Kuliah": "Basis Data", "SKS": 4, "Nilai Angka": 78, "Nilai Huruf": "B+" }
    ];
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, "Transkrip");
    // Write to Buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const base64Buffer = buffer.toString('base64');
    console.log("1. Dummy Excel Buffer Created. Size:", buffer.length);
    // 2. Test Parser Directly
    console.log("2. Testing Parser directly...");
    const parsed = await (0, transcript_parser_1.parseTranscript)(buffer);
    console.log("Parsed Data Sample:", parsed[0]);
    if (parsed.length !== 2)
        throw new Error("Parser failed to read all rows");
    console.log("Parser OK successfully.");
    // 3. Test Queue
    console.log("3. Testing Queue Integration...");
    const worker = (0, transcript_queue_1.createTranscriptWorker)();
    // Listen for completion
    worker.on('completed', (job) => {
        console.log(`[TEST] Job ${job.id} COMPLETED. Result:`, job.returnvalue);
        process.exit(0);
    });
    worker.on('failed', (job, err) => {
        console.error(`[TEST] Job ${job === null || job === void 0 ? void 0 : job.id} FAILED:`, err);
        process.exit(1);
    });
    // Add Job
    await (0, transcript_queue_1.addTranscriptJob)({
        fileBufferBase64: base64Buffer,
        fileName: 'test-transcript.xlsx',
        uploadedBy: 'user-test-id'
    });
    console.log("Job added to queue. Waiting for worker...");
}
testIntegration().catch(err => {
    console.error("Test Failed:", err);
    process.exit(1);
});
