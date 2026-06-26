import Redis from 'ioredis';
import { SessionState } from '@/types/module';

// In-memory fallback
const memoryStore = new Map<string, string>();

let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL);
  } catch (e) {
    console.error('Failed to connect to Redis', e);
  }
}

export async function getSession(sessionId: string): Promise<SessionState | null> {
  let data: string | null = null;
  if (redis) {
    data = await redis.get(`session:${sessionId}`);
  } else {
    data = memoryStore.get(`session:${sessionId}`) || null;
  }
  if (!data) return null;
  try {
    return JSON.parse(data) as SessionState;
  } catch {
    return null;
  }
}

export async function saveSession(sessionId: string, state: SessionState): Promise<void> {
  const data = JSON.stringify(state);
  if (redis) {
    await redis.set(`session:${sessionId}`, data, 'EX', 86400); // 24 hours
  } else {
    memoryStore.set(`session:${sessionId}`, data);
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (redis) {
    await redis.del(`session:${sessionId}`);
  } else {
    memoryStore.delete(`session:${sessionId}`);
  }
}
