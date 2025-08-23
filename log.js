import { getMongo } from './client.js';

/**
 * Log an event to MongoDB (no-op if MONGODB_URI not set).
 * @param {string} type
 * @param {object} payload
 */
export async function logEvent(type, payload = {}) {
  try {
    const { db } = await getMongo();
    if (!db) return;
    const col = db.collection('events');
    await col.insertOne({
      type,
      payload,
      at: new Date()
    });
  } catch (e) {
    // Best effort: do not crash the app because of logging
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[mongo] logEvent failed:', e?.message);
    }
  }
}
