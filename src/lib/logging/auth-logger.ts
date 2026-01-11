/**
 * Auth Logger [PB-ARC-03]
 * Logs authentication attempts for security auditing.
 * Currently prints to console (stdout), adaptable to database audit tables later.
 */

type AuthStatus = 'SUCCESS' | 'FAILURE' | 'ATTEMPT';

interface LogEntry {
    timestamp: string;
    event: 'AUTH_LOGIN';
    identifier: string; // NIP or NIM
    status: AuthStatus;
    ip?: string;
    userAgent?: string;
    details?: string;
}

export function logLoginAttempt(
    identifier: string,
    status: AuthStatus,
    details?: string
): void {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        event: 'AUTH_LOGIN',
        identifier,
        status,
        details,
    };

    // Structured Logging (JSON) for easy parsing by monitoring tools
    console.log(JSON.stringify(entry));
}
