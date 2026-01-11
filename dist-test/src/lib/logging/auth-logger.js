"use strict";
/**
 * Auth Logger [PB-ARC-03]
 * Logs authentication attempts for security auditing.
 * Currently prints to console (stdout), adaptable to database audit tables later.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLoginAttempt = logLoginAttempt;
function logLoginAttempt(identifier, status, details) {
    const entry = {
        timestamp: new Date().toISOString(),
        event: 'AUTH_LOGIN',
        identifier,
        status,
        details,
    };
    // Structured Logging (JSON) for easy parsing by monitoring tools
    console.log(JSON.stringify(entry));
}
