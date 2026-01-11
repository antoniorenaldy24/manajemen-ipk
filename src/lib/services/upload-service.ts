import prisma from '../db';

export type ImportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export class UploadService {

    /**
     * Creates a new import log entry.
     */
    async createImportLog(filename: string, userId: string) {
        return prisma.importLog.create({
            data: {
                filename,
                status: 'PENDING',
                created_by: userId
            }
        });
    }

    /**
     * Updates status and record count.
     */
    async updateImportStatus(logId: string, status: ImportStatus, recordsProcessed: number = 0, errorMessage?: string) {
        return prisma.importLog.update({
            where: { id: logId },
            data: {
                status,
                records_processed: recordsProcessed,
                error_message: errorMessage
            }
        });
    }

    /**
     * Fetch logs for history table.
     */
    async getImportHistory() {
        return prisma.importLog.findMany({
            orderBy: { created_at: 'desc' },
            take: 20
        });
    }
}

export const uploadService = new UploadService();
