import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'crypto';

// Use a fixed key for development/demo purposes if env is missing. 
// IN PRODUCTION: This MUST be a strong 32-byte hex string in .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');

console.log("ENCRYPTION_KEY_LOADED:", !!process.env.ENCRYPTION_KEY);

const IV_LENGTH = 16; // AES block size
const ALGORITHM = 'aes-256-gcm';

/**
 * Creates a deterministic hash of the NIM for blind indexing.
 * Uses HMAC-SHA256 with the static ENCRYPTION_KEY as salt/pepper.
 * Rule: PB-SEC-01 (Index)
 */
export function hashNIM(nim: string): string {
    // Use HMAC for keyed hashing (Static Salt effect)
    return createHmac('sha256', ENCRYPTION_KEY)
        .update(nim)
        .digest('hex');
}

/**
 * Encrypts the NIM for storage.
 * Rule: PB-SEC-01 (Storage)
 */
export function encryptNIM(nim: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(nim, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts the NIM for display.
 */
export function decryptNIM(encryptedText: string): string {
    // Validation
    if (ENCRYPTION_KEY.length !== 32) {
        console.warn(`[Crypto] Invalid Key Length: ${ENCRYPTION_KEY.length}. Expected 32 bytes.`);
    }

    try {
        const parts = encryptedText.split(':');
        // Data Integrity Check
        if (parts.length !== 3) {
            console.error('[Crypto] Invalid format. Expected iv:tag:content');
            return 'INVALID_FORMAT';
        }

        const [ivHex, authTagHex, encryptedHex] = parts;

        const decipher = createDecipheriv(
            ALGORITHM,
            ENCRYPTION_KEY,
            Buffer.from(ivHex, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('[Crypto] Decryption Failed:', error);
        // Graceful Fallback
        return 'INVALID_KEY_OR_DATA';
    }
}
