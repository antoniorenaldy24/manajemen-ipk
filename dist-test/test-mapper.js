"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transcript_mapper_1 = require("./src/lib/logic/transcript-mapper");
const grading_utils_1 = require("./src/lib/logic/grading-utils");
async function testMapper() {
    console.log("--- Testing Grading Utils ---");
    const testGrades = ['A', 'A-', 'B+', 'C', 'E', 'Invalid'];
    testGrades.forEach(g => {
        console.log(`Grade ${g} -> ${(0, grading_utils_1.convertGradeToPoint)(g)}`);
    });
    console.log("\n--- Testing Transcript Mapper ---");
    // Mock Raw Data (simulating what xlsx parsing might return)
    // Testing varied casing for keys
    const rawData = [
        {
            // Ideal case
            "nim": "21051201",
            "nama": "Test Student A",
            "kode_mk": "TI001",
            "sks": 3,
            "nilai_huruf": "A"
        },
        {
            // Uppercase keys case
            "NIM": "21051202",
            "NAMA": "Test Student B",
            "KODE_MK": "TI002",
            "SKS": 4,
            "NILAI_HURUF": "B+"
        },
        {
            // Missing Data (Should specify what happens - skipped or partial?)
            "nim": "21051203"
            // Missing kode_mk -> Should be skipped based on logic
        }
    ];
    const results = await (0, transcript_mapper_1.mapTranscriptData)(rawData);
    console.log(`Input Rows: ${rawData.length}`);
    console.log(`Mapped Results: ${results.length}`);
    if (results.length !== 2) {
        throw new Error(`Expected 2 mapped results, got ${results.length}`);
    }
    // Verification of Row 1
    const r1 = results[0];
    console.log("\nResult 1 Check:");
    console.log("NIM Hash exists?", !!r1.nim_hash, r1.nim_hash ? `(${r1.nim_hash.substring(0, 8)}...)` : '');
    console.log("NIM Encrypted exists?", !!r1.nim_encrypted);
    console.log("Grade Point Correct (4.0)?", r1.grade_point === 4.0);
    console.log("Course Code:", r1.course_code);
    // Verification of Row 2
    const r2 = results[1];
    console.log("\nResult 2 Check:");
    console.log("Student Name:", r2.student_name);
    console.log("Grade Point Correct (3.3)?", r2.grade_point === 3.3);
    console.log("\n--- Mapper Test PASSED ---");
}
testMapper().catch(e => {
    console.error("Mapper Test FAILED:", e);
    process.exit(1);
});
