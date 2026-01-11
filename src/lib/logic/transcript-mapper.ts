import { hashNIM, encryptNIM } from '../security/crypto';
import { convertGradeToPoint } from './grading-utils';

// --- Configuration ---
// These are fallback keys if fuzzy matching fails, but fuzzy matching handles most cases.
const COLUMN_MAP = {
    NIM: 'nim',
    NAMA: 'nama',
    KODE_MK: 'kode_mk',
    NAMA_MK: 'nama_mk',
    SKS: 'sks',
    NILAI_HURUF: 'nilai_huruf',
};

// --- Interfaces ---
interface MappedTranscriptRecord {
    // Security Fields
    nim_hash: string;
    nim_encrypted: string;

    // Student Info
    student_name: string;

    // Academic Record Fields
    course_code: string;
    course_name?: string;
    sks: number;
    grade_letter: string;
    grade_point: number; // Calculated

    // Metadata
    semester_taken?: number;
}

/**
 * Maps raw JSON data (from Parser) into a strictly typed, secure structure for the Database.
 * Enforces Blind Indexing [PB-SEC-01] on NIMs.
 * 
 * @param rawData - Array of objects from the file parser.
 * @returns Array of mapped records ready for database processing.
 */
export async function mapTranscriptData(rawData: any[]): Promise<MappedTranscriptRecord[]> {
    const mappedResults: MappedTranscriptRecord[] = [];
    const errors: any[] = [];

    for (const [index, row] of rawData.entries()) {
        try {
            // 1. Normalize Row Keys (Handle "SKS ", "Nilai Huruf " etc)
            const normalizedRow: Record<string, any> = {};
            Object.keys(row).forEach(key => {
                // Trim and lowercase the KEY itself
                const cleanKey = key.trim().toLowerCase();
                normalizedRow[cleanKey] = row[key];
            });

            // Helper to find value by trying specific keys
            // We search consistently in normalizedRow
            const findValue = (possibleKeys: string[]) => {
                for (const k of possibleKeys) {
                    if (normalizedRow[k] !== undefined) return normalizedRow[k];
                }
                return undefined;
            };

            const rawNim = findValue(['nim', 'no. ind. mhs.', 'no_ind_mhs']);
            const rawNama = findValue(['nama', 'nama mahasiswa', 'nama_mahasiswa']);
            const rawKodeMK = findValue(['kode_mk', 'kode mk', 'kode', 'kode_mata_kuliah']);
            const rawNamaMK = findValue(['nama_mk', 'nama mata kuliah', 'matakuliah', 'mata_kuliah']);
            const rawSks = findValue(['sks', 'sks mk', 'kredit', 'sks_mk']);
            const rawNilaiHuruf = findValue(['nilai_huruf', 'nilai', 'grade', 'huruf']);

            // 2. Validation
            const missingFields = [];
            if (!rawNim) missingFields.push('NIM');
            if (!rawKodeMK) missingFields.push('KODE_MK');

            if (missingFields.length > 0) {
                // Only log if critical fields are missing
                console.warn(`[Mapper] Row ${index + 1} skipped. Missing: ${missingFields.join(', ')}`);
                continue;
            }

            // 3. Transformation & Security
            const nimStr = String(rawNim).trim().toUpperCase();
            const sksNum = Number(rawSks) || 0; // Default to 0 if missing/NaN, handled in Calc logic
            const gradeLetter = String(rawNilaiHuruf || '').trim().toUpperCase();

            // [PB-SEC-01] Enforce Encryption BEFORE leaving this layer
            // Note: hashNIM now uses HMAC with static key (Deterministic)
            const nimHash = hashNIM(nimStr);
            const nimEncrypted = encryptNIM(nimStr);

            // [Conversion] Grade to Point
            const gradePoint = convertGradeToPoint(gradeLetter);

            console.log("MAPPING_ROW:", { nim: nimStr, hash: nimHash, sks: sksNum, grade_point: gradePoint });

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

        } catch (err) {
            console.error(`[Mapper] Error processing row ${index + 1}:`, err);
            errors.push({ row: index + 1, error: err });
        }
    }

    if (errors.length > 0) {
        console.warn(`[Mapper] Finished with ${errors.length} row errors.`);
    }

    return mappedResults;
}
