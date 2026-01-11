"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOut = exports.signIn = exports.auth = exports.handlers = void 0;
const next_auth_1 = __importDefault(require("next-auth"));
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const bcryptjs_1 = require("bcryptjs");
const db_1 = __importDefault(require("@/lib/db"));
const auth_logger_1 = require("./lib/logging/auth-logger");
const auth_config_1 = require("./auth.config");
_a = (0, next_auth_1.default)({
    ...auth_config_1.authConfig,
    providers: [
        (0, credentials_1.default)({
            name: "Monitoring IPK Login",
            credentials: {
                username: { label: "NIP / NIM", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const identifier = credentials.username;
                const password = credentials.password;
                (0, auth_logger_1.logLoginAttempt)(identifier, "ATTEMPT");
                try {
                    const user = await db_1.default.user.findUnique({
                        where: { email: identifier },
                    });
                    if (!user) {
                        (0, auth_logger_1.logLoginAttempt)(identifier, "FAILURE", "User not found");
                        return null;
                    }
                    const isMatch = await (0, bcryptjs_1.compare)(password, user.password_hash);
                    if (!isMatch) {
                        (0, auth_logger_1.logLoginAttempt)(identifier, "FAILURE", "Invalid password");
                        return null;
                    }
                    (0, auth_logger_1.logLoginAttempt)(identifier, "SUCCESS");
                    return {
                        id: user.id,
                        name: identifier,
                        email: user.email,
                        role: user.role,
                    };
                }
                catch (error) {
                    (0, auth_logger_1.logLoginAttempt)(identifier, "FAILURE", "System Error");
                    console.error("Auth Error:", error);
                    return null;
                }
            },
        }),
    ],
}), exports.handlers = _a.handlers, exports.auth = _a.auth, exports.signIn = _a.signIn, exports.signOut = _a.signOut;
