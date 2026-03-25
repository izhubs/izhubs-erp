import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

// Standard Redis connection for BullMQ
// Requires maxRetriesPerRequest to be null for BullMQ to function correctly with blocking commands
export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// The single queue for all digital metric synchronization
export const syncQueue = new Queue('digital-sync', { 
  connection: redisConnection 
});

// Global events listener
export const syncQueueEvents = new QueueEvents('digital-sync', { 
  connection: redisConnection 
});

if (process.env.NODE_ENV !== 'production') {
  syncQueueEvents.on('completed', ({ jobId }) => {
    console.log(`[BullMQ] Job ${jobId} completed`);
  });

  syncQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`[BullMQ] Job ${jobId} failed:`, failedReason);
  });
}
