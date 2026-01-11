import { hashSync } from 'bcryptjs';
import { decryptNIM } from '../security/crypto';

export function prepareUserCredentials(nimEncrypted: string) {
    let rawNIM = "UNKNOWN";
    try {
        rawNIM = decryptNIM(nimEncrypted);
    } catch (e) {
        console.error("NIM Decryption Failed", e);
        throw new Error("NIM Decryption Failed");
    }

    const defaultPassword = hashSync(rawNIM, 10);

    return {
        email: rawNIM,
        passwordHash: defaultPassword
    };
}
