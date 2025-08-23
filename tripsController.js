import { query, withTransaction } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { send } from '../emails/mailer.js';

export async function listTrips(req, res, next) {
  try {
    const { from, to, date, eco, priceMax, durationMax, ratingMin, limit = 20, offset = 0 } = req.query;

    const where = ['t.status = $1', 't.seats_available > 0'];
    const params = ['scheduled'];
    let i = params.length;

    if (from) { params.push(from); i += 1; where.push(`LOWER(t.origin_city)=LOWER($${i})`); }
    if (to) { params.push(to); i += 1; where.push(`LOWER(t.destination_city)=LOWER($${i})`); }
    if (date) {
      params.push(date); i += 1; const idxStart = i;
      params.push(date); i += 1; const idxEnd = i;
      where.push(`t.departure_time >= $${idxStart}::date AND t.departure_time < ($${idxEnd}::date + INTERVAL '1 day')`);
    }
    if (eco === 'true') where.push('t.is_ecologic = true');
    if (priceMax) { params.push(Number(priceMax)); i += 1; where.push(`t.price_cents <= $${i}`); }
    if (durationMax) {
      params.push(Number(durationMax)); i += 1;
      where.push(`EXTRACT(EPOCH FROM (t.arrival_time - t.departure_time))/60 <= $${i}`);
    }
    if (ratingMin) {
      params.push(Number(ratingMin)); i += 1;
      where.push(`COALESCE(dr.avg_rating,0) >= $${i}`);
    }

    params.push(Number(limit)); const limitIdx = ++i;
    params.push(Number(offset)); const offsetIdx = ++i;

    const sql = `
      SELECT t.*, u.pseudo AS driver_pseudo,
             COALESCE(dr.avg_rating,0) AS driver_avg_rating,
             COALESCE(dr.reviews_count,0) AS driver_reviews
      FROM trips t
      JOIN users u ON u.id = t.driver_id
      LEFT JOIN (
        SELECT driver_id, AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS reviews_count
        FROM reviews WHERE is_moderated = true
        GROUP BY driver_id
      ) dr ON dr.driver_id = t.driver_id
      WHERE ${where.join(' AND ')}
      ORDER BY t.departure_time ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;
    const rows = (await query(sql, params)).rows;

    let nextAvailableDate = null;
    if (rows.length === 0 && from && to && date) {
      const n = await query(
        `SELECT MIN(departure_time) AS next_date
         FROM trips
         WHERE status='scheduled' AND seats_available>0
           AND LOWER(origin_city)=LOWER($1) AND LOWER(destination_city)=LOWER($2)
           AND departure_time >= $3::date`,
        [from, to, date]
      );
      nextAvailableDate = n.rows[0]?.next_date || null;
    }

    res.json({ data: rows, nextAvailableDate });
  } catch (e) { next(e); }
}

export async function getTrip(req, res, next) {
  try {
    const { id } = req.params;
    const { rows, rowCount } = await query(
      `SELECT t.*, u.pseudo AS driver_pseudo,
              v.make, v.model, v.energy, v.color,
              COALESCE(dr.avg_rating,0) AS driver_avg_rating,
              COALESCE(dr.reviews_count,0) AS driver_reviews
       FROM trips t
       JOIN users u ON u.id=t.driver_id
       JOIN vehicles v ON v.id=t.vehicle_id
       LEFT JOIN (
         SELECT driver_id, AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS reviews_count
         FROM reviews WHERE is_moderated=true GROUP BY driver_id
       ) dr ON dr.driver_id=t.driver_id
       WHERE t.id=$1`,
      [id]
    );
    if (!rowCount) return next({ status: 404, message: 'Trip not found' });

    const trip = rows[0];
    const reviews = (await query(
      `SELECT r.*, u.pseudo AS reviewer_pseudo
       FROM reviews r JOIN users u ON u.id=r.reviewer_id
       WHERE r.trip_id=$1 AND r.is_moderated=true ORDER BY r.created_at DESC`,
      [id]
    )).rows;

    res.json({ data: { ...trip, reviews } });
  } catch (e) { next(e); }
}

export async function createTrip(req, res, next) {
  try {
    const driver_id = req.user.id;
    const { vehicle_id, origin_city, destination_city, departure_time, arrival_time, price_cents, seats_total } = req.body;

    const ve = await query('SELECT user_id, energy FROM vehicles WHERE id=$1', [vehicle_id]);
    if (!ve.rowCount) return next({ status: 400, message: 'Vehicle not found' });
    if (ve.rows[0].user_id !== driver_id) return next({ status: 403, message: 'Vehicle does not belong to driver' });

    const is_ecologic = ve.rows[0].energy === 'electric';
    const id = uuidv4();

    await query(
      `INSERT INTO trips
       (id, driver_id, vehicle_id, origin_city, destination_city, departure_time, arrival_time, price_cents,
        seats_total, seats_available, is_ecologic, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10,'scheduled')`,
      [id, driver_id, vehicle_id, origin_city, destination_city, departure_time, arrival_time, price_cents, seats_total, is_ecologic]
    );

    res.status(201).json({ data: { id } });
  } catch (e) { next(e); }
}

export async function requestParticipation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;

    const t = await query('SELECT driver_id, seats_available, status FROM trips WHERE id=$1', [tripId]);
    if (!t.rowCount) return next({ status: 404, message: 'Trip not found' });
    const trip = t.rows[0];
    if (trip.driver_id === userId) return next({ status: 400, message: 'Driver cannot join own trip' });
    if (trip.status !== 'scheduled') return next({ status: 400, message: 'Trip not open' });
    if (trip.seats_available <= 0) return next({ status: 400, message: 'No seats available' });

    await query(
      `INSERT INTO trip_participants (id, trip_id, user_id, status)
       VALUES ($1,$2,$3,'pending')`,
      [uuidv4(), tripId, userId]
    );

    res.status(201).json({ data: { status: 'pending' } });
  } catch (e) {
    if (e.code === '23505') return next({ status: 409, message: 'Already requested' });
    next(e);
  }
}

export async function startTrip(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const r = await query('UPDATE trips SET status=$1 WHERE id=$2 AND driver_id=$3 AND status=$4 RETURNING id', ['started', id, userId, 'scheduled']);
    if (!r.rowCount) return next({ status: 400, message: 'Cannot start trip' });
    res.json({ data: { status: 'started' } });
  } catch (e) { next(e); }
}

export async function arriveTrip(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const r = await query('UPDATE trips SET status=$1 WHERE id=$2 AND driver_id=$3 AND status=$4 RETURNING id', ['arrived', id, userId, 'started']);
    if (!r.rowCount) return next({ status: 400, message: 'Cannot arrive trip' });

    const ps = await query(
      `SELECT u.email FROM trip_participants p JOIN users u ON u.id=p.user_id
       WHERE p.trip_id=$1 AND p.status='accepted'`,
      [id]
    );
    await Promise.all(ps.rows.map(r => send(r.email, 'EcoRide — Votre avis', `<p>Merci d'avoir voyagé. Laissez un avis !</p>`)));

    res.json({ data: { status: 'arrived' } });
  } catch (e) { next(e); }
}

export async function cancelTrip(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await withTransaction(async (client) => {
      const up = await client.query(
        'UPDATE trips SET status=$1 WHERE id=$2 AND driver_id=$3 AND status IN ($4,$5) RETURNING id, price_cents',
        ['cancelled', id, userId, 'scheduled', 'started']
      );
      if (!up.rowCount) throw { status: 400, message: 'Cannot cancel trip' };

      const price_cents = up.rows[0].price_cents;

      const acc = await client.query(
        `SELECT p.user_id, u.email FROM trip_participants p JOIN users u ON u.id=p.user_id
         WHERE p.trip_id=$1 AND p.status='accepted'`, [id]
      );

      for (const row of acc.rows) {
        const refund = Math.ceil(price_cents / 100);
        await client.query('INSERT INTO credits_ledger (user_id, delta, reason) VALUES ($1,$2,$3)', [row.user_id, refund, 'trip_cancelled_refund']);
        await client.query('UPDATE users SET credits = credits + $1 WHERE id=$2', [refund, row.user_id]);
      }

      await client.query('UPDATE trips SET seats_available = seats_total WHERE id=$1', [id]);

      Promise.all(acc.rows.map(r => send(r.email, 'EcoRide — Trajet annulé', `<p>Votre trajet a été annulé.</p>`))).catch(() => {});
    });

    res.json({ data: { status: 'cancelled' } });
  } catch (e) { next(e); }
}
export async function myTrips(req, res, next) {
  try {
    const userId = req.user.id;
    const role = (req.query.role || 'all').toLowerCase(); // 'driver' | 'passenger' | 'all'
    const upcoming = String(req.query.upcoming || 'false').toLowerCase() === 'true';
    const statusParam = (req.query.status || '').trim();
    const statusList = statusParam ? statusParam.split(',').map(s => s.trim()) : (upcoming ? ['scheduled','started'] : null);

    function buildWhere() {
      const whereParts = [];
      const params = [];
      if (statusList) {
        whereParts.push(`t.status = ANY($${params.length + 1})`);
        params.push(statusList);
      }
      if (upcoming) {
        whereParts.push(`t.departure_time >= $${params.length + 1}`);
        params.push(new Date().toISOString());
      }
      return { where: whereParts.length ? ' AND ' + whereParts.join(' AND ') : '', params };
    }

    const data = [];

    if (role === 'driver' || role === 'all') {
      const { where, params } = buildWhere();
      const r = await query(
        `SELECT t.*, u.pseudo AS driver_pseudo,
                COALESCE(dr.avg_rating,0) AS driver_avg_rating,
                COALESCE(dr.reviews_count,0) AS driver_reviews
         FROM trips t
         JOIN users u ON u.id=t.driver_id
         LEFT JOIN (
           SELECT driver_id, AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS reviews_count
           FROM reviews WHERE is_moderated=true GROUP BY driver_id
         ) dr ON dr.driver_id=t.driver_id
         WHERE t.driver_id=$1${where}
         ORDER BY t.departure_time ASC`,
        [userId, ...params]
      );
      data.push(...r.rows);
    }

    if (role === 'passenger' || role === 'all') {
      const { where, params } = buildWhere();
      const r = await query(
        `SELECT t.*, u.pseudo AS driver_pseudo,
                COALESCE(dr.avg_rating,0) AS driver_avg_rating,
                COALESCE(dr.reviews_count,0) AS driver_reviews
         FROM trips t
         JOIN users u ON u.id=t.driver_id
         JOIN trip_participants p ON p.trip_id=t.id AND p.user_id=$1 AND p.status='accepted'
         LEFT JOIN (
           SELECT driver_id, AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS reviews_count
           FROM reviews WHERE is_moderated=true GROUP BY driver_id
         ) dr ON dr.driver_id=t.driver_id
         WHERE true${where}
         ORDER BY t.departure_time ASC`,
        [userId, ...params]
      );
      data.push(...r.rows);
    }

    const seen = new Set();
    const unique = [];
    for (const t of data) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      unique.push(t);
    }
    unique.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));

    res.json({ data: unique });
  } catch (e) { next(e); }
}
