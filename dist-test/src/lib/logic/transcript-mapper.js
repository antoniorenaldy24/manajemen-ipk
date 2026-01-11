"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTranscriptData = mapTranscriptData;
const crypto_1 = require("../security/crypto");
const grading_utils_1 = require("./grading-utils");
// --- Configuration ---
// Modify these values if the Excel/CSV column headers change.
const COLUMN_MAP = {
    NIM: 'nim',
    NAMA: 'nama',
    KODE_MK: 'kode_mk',
    NAMA_MK: 'nama_mk', // Optional, if needed for Course creation
    SKS: 'sks',
    NILAI_HURUF: 'nilai_huruf',
};
/**
 * Maps raw JSON data (from Parser) into a strictly typed, secure structure for the Database.
 * Enforces Blind Indexing [PB-SEC-01] on NIMs.
 *
 * @param rawData - Array of objects from the file parser.
 * @returns Array of mapped records ready for database processing.
 */
async function mapTranscriptData(rawData) {
    const mappedResults = [];
    const errors = [];
    // Assuming we might process thousands, traditional loop is fine. 
    // If strict performance needed, could map.
    for (const [index, row] of rawData.entries()) {
        try {
            // 1. Extract Raw Values using Config Map
            // Using logic: row[COLUMN_MAP.KEY] || row[Fallback]
            // Handle case-insensitivity of keys/headers by normalizing row keys if needed? 
            // For now, assume exact match or simple variance. 
            // Better: find key case-insensitively if not found directly.
            const getValue = (key) => {
                // Try direct access
                if (row[key] !== undefined)
                    return row[key];
                // Try lowercase
                if (row[key.toLowerCase()] !== undefined)
                    return row[key.toLowerCase()];
                // Try uppercase
                if (row[key.toUpperCase()] !== undefined)
                    return row[key.toUpperCase()];
                return undefined;
            };
            const rawNim = getValue(COLUMN_MAP.NIM);
            const rawNama = getValue(COLUMN_MAP.NAMA);
            const rawKodeMK = getValue(COLUMN_MAP.KODE_MK);
            const rawNamaMK = getValue(COLUMN_MAP.NAMA_MK);
            const rawSks = getValue(COLUMN_MAP.SKS);
            const rawNilaiHuruf = getValue(COLUMN_MAP.NILAI_HURUF);
            // 2. Validation
            const missingFields = [];
            if (!rawNim)
                missingFields.push(COLUMN_MAP.NIM);
            if (!rawKodeMK)
                missingFields.push(COLUMN_MAP.KODE_MK);
            // SKS and Nilai might be optional/defaultable? Let's enforce for integrity.
            // if (!rawSks) missingFields.push(COLUMN_MAP.SKS); 
            if (missingFields.length > 0) {
                console.warn(`[Mapper] Row ${index + 1} skipped. Missing: ${missingFields.join(', ')}`);
                continue; // Skip invalid rows
            }
            // 3. Transformation & Security
            const nimStr = String(rawNim).trim();
            const sksNum = Number(rawSks) || 0;
            const gradeLetter = String(rawNilaiHuruf || '').trim().toUpperCase();
            // [PB-SEC-01] Enforce Encryption BEFORE leaving this layer
            const nimHash = (0, crypto_1.hashNIM)(nimStr);
            const nimEncrypted = (0, crypto_1.encryptNIM)(nimStr);
            // [Conversion] Grade to Point
            const gradePoint = (0, grading_utils_1.convertGradeToPoint)(gradeLetter);
            mappedResults.push({
                nim_hash: nimHash,
                nim_encrypted: nimEncrypted,
                student_name: rawNama ? String(rawNama).trim() : 'Unknown Student',
                course_code: String(rawKodeMK).trim().toUpperCase(),
                course_name: rawNamaMK ? String(rawNamaMK).trim() : undefined,
                sks: sksNum,
                grade_letter: gradeLetter,
                grade_point: gradePoint
            });
        }
        catch (err) {
            console.error(`[Mapper] Error processing row ${index + 1}:`, err);
            errors.push({ row: index + 1, error: err });
        }
    }
    if (errors.length > 0) {
        console.warn(`[Mapper] Finished with ${errors.length} row errors.`);
    }
    return mappedResults;
}
