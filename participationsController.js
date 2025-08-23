import { withTransaction } from '../config/db.js';
import { send } from '../emails/mailer.js';

export async function acceptParticipation(req, res, next) {
  try {
    const pid = req.params.pid;
    const driverId = req.user.id;

    await withTransaction(async (client) => {
      // Lock participation and related trip row
      const pRes = await client.query(
        `SELECT p.id, p.user_id AS passenger_id, t.id AS trip_id, t.driver_id, t.seats_available, t.price_cents,
                pu.email AS passenger_email, du.email AS driver_email
         FROM trip_participants p
         JOIN trips t ON t.id=p.trip_id
         JOIN users pu ON pu.id=p.user_id
         JOIN users du ON du.id=t.driver_id
         WHERE p.id=$1 FOR UPDATE`,
        [pid]
      );
      if (!pRes.rowCount) throw { status: 404, message: 'Participation not found' };
      const P = pRes.rows[0];
      if (P.driver_id !== driverId) throw { status: 403, message: 'Not your trip' };
      if (P.seats_available <= 0) throw { status: 400, message: 'No seats available' };

      // Accept if still pending
      const upd = await client.query(
        `UPDATE trip_participants SET status='accepted' WHERE id=$1 AND status='pending' RETURNING id`,
        [pid]
      );
      if (!upd.rowCount) throw { status: 400, message: 'Already accepted/cancelled' };

      // Decrement seat
      await client.query('UPDATE trips SET seats_available = seats_available - 1 WHERE id=$1', [P.trip_id]);

      // Debit passenger credits: 1€ -> 1 crédit (arrondi supérieur)
      const debit = Math.ceil(P.price_cents / 100);
      await client.query('INSERT INTO credits_ledger (user_id, delta, reason) VALUES ($1,$2,$3)', [P.passenger_id, -debit, 'trip_join']);
      await client.query('UPDATE users SET credits = credits - $1 WHERE id=$2', [debit, P.passenger_id]);

      // Notify by email (best-effort, out-of-tx)
      Promise.all([
        send(P.passenger_email, 'EcoRide — Demande acceptée', `<p>Votre demande a été acceptée.</p>`),
        send(P.driver_email, 'EcoRide — Vous avez un passager', `<p>Une demande a été acceptée.</p>`)
      ]).catch(() => {});
    });

    res.json({ data: { status: 'accepted' } });
  } catch (e) { next(e); }
}
