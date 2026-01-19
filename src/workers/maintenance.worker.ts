
import { Worker } from 'bullmq';
import redis from '../lib/redis';
import { refreshAnalyticsViews } from '../lib/db/maintenance';

const QUEUE_NAME = 'maintenance-queue';

export const createMaintenanceWorker = () => {
    return new Worker(QUEUE_NAME, async (job) => {
        console.log(`[Maintenance Worker] Processing job ${job.id}: ${job.name}`);

        if (job.name === 'refresh-analytics') {
            await refreshAnalyticsViews();
        } else {
            console.warn(`[Maintenance Worker] Unknown job type: ${job.name}`);
        }

        return { status: 'DONE' };
    }, {
        connection: redis as any,
        concurrency: 1 // Sequential refresh to avoid DB locking issues
    });
};
