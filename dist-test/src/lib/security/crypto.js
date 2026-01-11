"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashNIM = hashNIM;
exports.encryptNIM = encryptNIM;
exports.decryptNIM = decryptNIM;
const crypto_1 = require("crypto");
// Use a fixed key for development/demo purposes if env is missing. 
// IN PRODUCTION: This MUST be a strong 32-byte hex string in .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
const IV_LENGTH = 16; // AES block size
const ALGORITHM = 'aes-256-gcm';
/**
 * Creates a deterministic hash of the NIM for blind indexing (Looking up unique records).
 * Rule: PB-SEC-01 (Index)
 */
function hashNIM(nim) {
    return (0, crypto_1.createHash)('sha256').update(nim).digest('hex');
}
/**
 * Encrypts the NIM for storage.
 * Rule: PB-SEC-01 (Storage)
 */
function encryptNIM(nim) {
    const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(nim, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
/**
 * Decrypts the NIM for display.
 */
function decryptNIM(encryptedText) {
    const parts = encryptedText.split(':');
    if (parts.length !== 3)
        throw new Error('Invalid encrypted format');
    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
