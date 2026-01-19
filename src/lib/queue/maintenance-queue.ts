
import { Queue } from 'bullmq';
import redis from '../redis';

const QUEUE_NAME = 'maintenance-queue';

export const maintenanceQueue = new Queue<any, any, string>(QUEUE_NAME, {
    connection: redis as any,
});

/**
 * Adds a job to refresh materialized views.
 */
export async function addRefreshJob() {
    console.log(`[Queue] Adding maintenance job: refresh-analytics`);
    return await maintenanceQueue.add('refresh-analytics', {}, {
        removeOnComplete: true,
        removeOnFail: 100
    });
}
