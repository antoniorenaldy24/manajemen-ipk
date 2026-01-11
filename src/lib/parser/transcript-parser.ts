import * as XLSX from 'xlsx';

/**
 * Parses an uploaded file buffer (Excel/CSV) into a JSON array.
 * @param buffer - The file buffer.
 * @returns A promise that resolves to an array of objects representing rows.
 */
export async function parseTranscript(buffer: Buffer): Promise<any[]> {
    try {
        // Read the buffer type. type: 'buffer' is standard for parsing file uploads.
        // For CSV, SheetJS usually auto-detects, but if specific options are needed:
        // const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

        const workbook = XLSX.read(buffer, { type: 'buffer' });

        // Assuming data is in the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new Error("No sheets found in file");
        }

        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON. 'defval: ""' ensures empty cells are empty strings, not undefined.
        const sheetHeaders = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        console.log("RAW_HEADERS:", sheetHeaders);

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!jsonData || jsonData.length === 0) {
            throw new Error("Parsed sheet is empty");
        }

        console.log(`[Parser] Successfully parsed ${jsonData.length} rows from sheet '${sheetName}'.`);

        return jsonData;
    } catch (error) {
        console.error("[Parser] Error parsing transcript file:", error);
        throw new Error("Failed to parse file. Ensure it is a valid Excel or CSV file.");
    }
}
