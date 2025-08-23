import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const reviewer_id = req.user.id;
    const { trip_id, rating, comment } = req.body;

    // Vérifier que l'utilisateur a participé (accepté) à un trajet arrivé
    const ok = await query(
      `SELECT 1
       FROM trip_participants p
       JOIN trips t ON t.id=p.trip_id
       WHERE p.trip_id=$1 AND p.user_id=$2 AND p.status='accepted' AND t.status='arrived'`,
      [trip_id, reviewer_id]
    );
    if (!ok.rowCount) return next({ status: 400, message: 'Not eligible to review' });

    // Récupérer le conducteur du trajet
    const driver = await query('SELECT driver_id FROM trips WHERE id=$1', [trip_id]);
    if (!driver.rowCount) return next({ status: 404, message: 'Trip not found' });
    const driver_id = driver.rows[0].driver_id;

    const id = uuidv4();
    await query(
      `INSERT INTO reviews (id, trip_id, reviewer_id, driver_id, rating, comment, is_moderated)
       VALUES ($1,$2,$3,$4,$5,$6,false)`,
      [id, trip_id, reviewer_id, driver_id, rating, comment || null]
    );

    res.status(201).json({ data: { id, is_moderated: false } });
  } catch (e) { next(e); }
}

// POST /api/reviews/:id/moderate
export async function moderateReview(req, res, next) {
  try {
    const { id } = req.params;
    const r = await query('UPDATE reviews SET is_moderated=true WHERE id=$1 RETURNING id', [id]);
    if (!r.rowCount) return next({ status: 404, message: 'Review not found' });
    res.json({ data: { id, is_moderated: true } });
  } catch (e) { next(e); }
}
export async function listPendingReviews(_req, res, next) {
  try {
    const { rows } = await query(
      `SELECT r.id, r.trip_id, r.reviewer_id, r.driver_id, r.rating, r.comment, r.created_at,
              u.pseudo AS reviewer_pseudo, du.pseudo AS driver_pseudo
       FROM reviews r
       JOIN users u ON u.id=r.reviewer_id
       JOIN users du ON du.id=r.driver_id
       WHERE r.is_moderated=false
       ORDER BY r.created_at DESC
       LIMIT 100`
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
}
