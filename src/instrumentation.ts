export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('[Instrumentation] Registering Worker...');

        // Dynamic import to avoid bundling worker dependencies in Edge runtime if applicable
        // and to ensure clean separation.
        const { createTranscriptWorker } = await import('./lib/queue/transcript-queue');

        // Initialize the worker
        const worker = createTranscriptWorker();

        // Attach to global to prevent GC or duplicate initialization in Dev mode if needed
        // but typically register runs once. For Dev HMR, we might want to check global.
        if (!global.transcriptWorker) {
            global.transcriptWorker = worker;
            console.log('[Worker] Mesin Pemroses Aktif (Initialized)');
        } else {
            console.log('[Worker] Worker already active.');
        }
    }
}

declare global {
    var transcriptWorker: any;
}
