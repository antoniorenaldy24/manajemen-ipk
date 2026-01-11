"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareUserCredentials = prepareUserCredentials;
const bcryptjs_1 = require("bcryptjs");
const crypto_1 = require("../security/crypto");
function prepareUserCredentials(nimEncrypted) {
    let rawNIM = "UNKNOWN";
    try {
        rawNIM = (0, crypto_1.decryptNIM)(nimEncrypted);
    }
    catch (e) {
        console.error("NIM Decryption Failed", e);
        throw new Error("NIM Decryption Failed");
    }
    const defaultPassword = (0, bcryptjs_1.hashSync)(rawNIM, 10);
    return {
        email: rawNIM,
        passwordHash: defaultPassword
    };
}
