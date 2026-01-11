"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcriptQueueEvents = exports.createTranscriptWorker = exports.transcriptQueue = void 0;
exports.addTranscriptJob = addTranscriptJob;
const bullmq_1 = require("bullmq");
const transcript_parser_1 = require("../parser/transcript-parser");
const redis_1 = __importDefault(require("../redis"));
const QUEUE_NAME = 'transcript-import-queue';
// 1. Queue Producer (SERVER-SIDE usage)
// 1. Queue Producer (SERVER-SIDE usage)
exports.transcriptQueue = new bullmq_1.Queue(QUEUE_NAME, {
    connection: redis_1.default,
});
/**
 * Adds a transcript parsing job to the queue.
 */
async function addTranscriptJob(data) {
    console.log(`[Queue] Adding job for file: ${data.fileName}`);
    return await exports.transcriptQueue.add('import-transcript', data);
}
// 2. Worker (SERVER-SIDE usage - Usually in a separate process or API route)
// In Next.js, this might run in a separate custom server script or via a specific API route triggered by cron/event.
// For now, we define the worker function logic here.
const createTranscriptWorker = () => {
    return new bullmq_1.Worker(QUEUE_NAME, async (job) => {
        console.log(`[Worker] Processing job ${job.id}: ${job.data.fileName}`);
        try {
            // Deserialize Buffer
            const buffer = Buffer.from(job.data.fileBufferBase64, 'base64');
            // Parse (Integration with Parser Library)
            const rawData = await (0, transcript_parser_1.parseTranscript)(buffer);
            // Map (Integration with Logic Mapper)
            const { mapTranscriptData } = await Promise.resolve().then(() => __importStar(require('../logic/transcript-mapper')));
            const mappedRecords = await mapTranscriptData(rawData);
            // Save (Integration with Storage Service)
            const { transcriptService } = await Promise.resolve().then(() => __importStar(require('../services/transcript-service')));
            await transcriptService.saveTranscriptData(mappedRecords, job.data.uploadedBy);
            console.log(`[Worker] Job ${job.id} Processed: ${mappedRecords.length} records saved.`);
            return { processed: mappedRecords.length, status: 'COMPLETED' };
        }
        catch (error) {
            console.error(`[Worker] Job ${job.id} Failed:`, error);
            throw error;
        }
    }, {
        connection: redis_1.default,
        concurrency: 5 // Process 5 files concurrently
    });
};
exports.createTranscriptWorker = createTranscriptWorker;
// Queue Events (Monitoring)
exports.transcriptQueueEvents = new bullmq_1.QueueEvents(QUEUE_NAME, {
    connection: redis_1.default,
});
