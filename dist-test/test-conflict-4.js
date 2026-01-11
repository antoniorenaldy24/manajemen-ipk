"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./src/lib/db"));
const bcryptjs_1 = require("bcryptjs");
const client_1 = require("@prisma/client");
const crypto_1 = require("./src/lib/security/crypto");
console.log("ALL IMPORTS OK");
console.log("Prisma:", !!db_1.default);
console.log("Hash:", !!bcryptjs_1.hashSync);
console.log("Role:", !!client_1.Role);
console.log("Decrypt:", !!crypto_1.decryptNIM);
