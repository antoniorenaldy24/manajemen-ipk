"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log("1. Importing Prisma...");
console.log("Prisma Imported.");
console.log("2. Importing TranscriptService...");
const transcript_service_1 = require("./src/lib/services/transcript-service");
console.log("TranscriptService Imported.");
console.log("2b. Importing Crypto...");
console.log("Crypto Imported.");
async function test() {
    console.log("3. Testing Service connectivity (mock)...");
    console.log("Service instance:", !!transcript_service_1.transcriptService);
    console.log("Done.");
}
test().catch(console.error);
