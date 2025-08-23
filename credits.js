import { withTransaction } from '../config/db.js';

/**
 * Add credits to a user inside an existing transaction.
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @param {number} delta  Positive to credit, negative to debit
 * @param {string} reason
 */
export async function addCredits(client, userId, delta, reason) {
  if (!client || typeof client.query !== 'function') {
    throw new Error('addCredits requires a pg client within a transaction');
  }
  await client.query('INSERT INTO credits_ledger (user_id, delta, reason) VALUES ($1,$2,$3)', [userId, delta, reason]);
  await client.query('UPDATE users SET credits = credits + $1 WHERE id=$2', [delta, userId]);
}

/**
 * Helper to run a set of credit operations inside a transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} fn
 */
export async function inTransaction(fn) {
  return withTransaction(fn);
}
