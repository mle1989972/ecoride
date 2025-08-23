import { query } from '../config/db.js';

export async function getMyPreferences(req, res, next) {
  try {
    const userId = req.user.id;
    const r = await query('SELECT * FROM preferences WHERE user_id=$1', [userId]);
    if (!r.rowCount) {
      // create defaults lazily
      const ins = await query(
        'INSERT INTO preferences (user_id, smoke_allowed, animals_allowed, notes) VALUES ($1,false,false,NULL) RETURNING *',
        [userId]
      );
      return res.json({ data: ins.rows[0] });
    }
    res.json({ data: r.rows[0] });
  } catch (e) { next(e); }
}

export async function updateMyPreferences(req, res, next) {
  try {
    const userId = req.user.id;
    const { smoke_allowed, animals_allowed, notes } = req.body;

    const r = await query(
      `INSERT INTO preferences (user_id, smoke_allowed, animals_allowed, notes)
       VALUES ($1, COALESCE($2,false), COALESCE($3,false), $4)
       ON CONFLICT (user_id) DO UPDATE SET
         smoke_allowed = COALESCE(EXCLUDED.smoke_allowed, preferences.smoke_allowed),
         animals_allowed = COALESCE(EXCLUDED.animals_allowed, preferences.animals_allowed),
         notes = COALESCE(EXCLUDED.notes, preferences.notes)
       RETURNING *`,
      [userId, smoke_allowed, animals_allowed, notes ?? null]
    );
    res.json({ data: r.rows[0] });
  } catch (e) { next(e); }
}
