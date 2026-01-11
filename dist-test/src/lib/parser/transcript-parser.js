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
exports.parseTranscript = parseTranscript;
const XLSX = __importStar(require("xlsx"));
/**
 * Parses an uploaded file buffer (Excel/CSV) into a JSON array.
 * @param buffer - The file buffer.
 * @returns A promise that resolves to an array of objects representing rows.
 */
async function parseTranscript(buffer) {
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        if (!jsonData || jsonData.length === 0) {
            throw new Error("Parsed sheet is empty");
        }
        console.log(`[Parser] Successfully parsed ${jsonData.length} rows from sheet '${sheetName}'.`);
        return jsonData;
    }
    catch (error) {
        console.error("[Parser] Error parsing transcript file:", error);
        throw new Error("Failed to parse file. Ensure it is a valid Excel or CSV file.");
    }
}
