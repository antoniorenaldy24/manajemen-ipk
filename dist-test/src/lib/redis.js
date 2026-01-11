"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const getRedisConnection = () => {
    // Common connection options
    const options = {
        maxRetriesPerRequest: null, // Required by BullMQ
        enableReadyCheck: false,
    };
    const connection = new ioredis_1.default(REDIS_URL, options);
    connection.on('error', (err) => {
        console.error('[Redis] Connection Error:', err);
    });
    return connection;
};
const redis = (_a = globalThis.redisGlobal) !== null && _a !== void 0 ? _a : getRedisConnection();
if (process.env.NODE_ENV !== 'production') {
    globalThis.redisGlobal = redis;
}
exports.default = redis;
