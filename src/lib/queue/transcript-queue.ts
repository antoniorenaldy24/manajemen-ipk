import { Queue, Worker, QueueEvents } from 'bullmq';
import { parseTranscript } from '../parser/transcript-parser';
import redis from '../redis';

// Basic Job Interface
export interface TranscriptJobData {
    fileBufferBase64: string; // BullMQ stores JSON, so Buffer needs serialization
    fileName: string;
    uploadedBy: string; // User ID
    logId?: string; // Optional for backward compatibility, but required for Task 08
}

const QUEUE_NAME = 'transcript-import-queue';

// 1. Queue Producer (SERVER-SIDE usage)
// 1. Queue Producer (SERVER-SIDE usage)
export const transcriptQueue = new Queue<TranscriptJobData, any, string>(QUEUE_NAME, {
    connection: redis as any,
});

/**
 * Adds a transcript parsing job to the queue.
 */
export async function addTranscriptJob(data: TranscriptJobData) {
    console.log(`[Queue] Adding job for file: ${data.fileName}`);
    return await transcriptQueue.add('import-transcript', data);
}


// 2. Worker (SERVER-SIDE usage - Usually in a separate process or API route)
// In Next.js, this might run in a separate custom server script or via a specific API route triggered by cron/event.
// For now, we define the worker function logic here.
export const createTranscriptWorker = () => {
    return new Worker<TranscriptJobData>(QUEUE_NAME, async (job) => {
        console.log(`[Worker] Processing job ${job.id}: ${job.data.fileName}`);

        // Lazy load service to avoid cyclic deps or runtime import issues during initialization
        const { uploadService } = await import('../services/upload-service');
        const logId = job.data.logId;

        // Update Log: PROCESSING
        if (logId) await uploadService.updateImportStatus(logId, 'PROCESSING');

        try {
            // Deserialize Buffer
            const buffer = Buffer.from(job.data.fileBufferBase64, 'base64');

            // Parse (Integration with Parser Library)
            const { parseTranscript } = await import('../parser/transcript-parser');
            const rawData = await parseTranscript(buffer);

            // Map (Integration with Logic Mapper)
            const { mapTranscriptData } = await import('../logic/transcript-mapper');
            const mappedRecords = await mapTranscriptData(rawData);

            // Save (Integration with Storage Service)
            const { transcriptService } = await import('../services/transcript-service');
            await transcriptService.saveTranscriptData(mappedRecords, job.data.uploadedBy);

            console.log(`[Worker] Job ${job.id} Processed: ${mappedRecords.length} records saved.`);

            // Update Log: COMPLETED
            if (logId) await uploadService.updateImportStatus(logId, 'COMPLETED', mappedRecords.length);

            return { processed: mappedRecords.length, status: 'COMPLETED' };

        } catch (error: any) {
            console.error(`[Worker] Job ${job.id} Failed:`, error);

            // Update Log: FAILED
            if (logId) await uploadService.updateImportStatus(logId, 'FAILED', 0, error.message || 'Unknown Error');

            throw error;
        }
    }, {
        connection: redis as any,
        concurrency: 5 // Process 5 files concurrently
    });
};

// Queue Events (Monitoring)
export const transcriptQueueEvents = new QueueEvents(QUEUE_NAME, {
    connection: redis as any,
});
