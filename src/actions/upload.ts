'use server';

import { auth } from '@/auth';
import { addTranscriptJob } from '@/lib/queue/transcript-queue';
import { uploadService } from '@/lib/services/upload-service';
import { revalidatePath } from 'next/cache';

export interface UploadState {
    success: boolean;
    message: string;
}

export async function uploadTranscript(prevState: UploadState, formData: FormData): Promise<UploadState> {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return { success: false, message: 'Unauthorized' };
    }

    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { success: false, message: 'No file uploaded' };
    }

    // 1. Create Log Entry
    let logEntry;
    try {
        logEntry = await uploadService.createImportLog(file.name, session.user.id);
    } catch (e) {
        console.error("Failed to create log", e);
        return { success: false, message: 'Database error: Could not init log' };
    }

    try {
        // 2. Convert to Base64 (to pass to Queue)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        // 3. Enqueue Job
        // Pass logId to worker so it can update status
        await addTranscriptJob({
            fileBufferBase64: base64,
            fileName: file.name,
            uploadedBy: session.user.id,
            logId: logEntry.id
        });

        revalidatePath('/dashboard/upload');
        return { success: true, message: 'File queued successfully' };

    } catch (e) {
        // Mark log as failed if queuing failed
        await uploadService.updateImportStatus(logEntry.id, 'FAILED', 0, 'Queue Error');
        return { success: false, message: 'Failed to queue file processing' };
    }
}
