import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function listVehicles(req, res, next) {
  try {
    const userId = req.user.id;
    const { rows } = await query('SELECT * FROM vehicles WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
    res.json({ data: rows });
  } catch (e) { next(e); }
}

export async function getVehicle(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rows, rowCount } = await query('SELECT * FROM vehicles WHERE id=$1 AND user_id=$2', [id, userId]);
    if (!rowCount) return next({ status: 404, message: 'Vehicle not found' });
    res.json({ data: rows[0] });
  } catch (e) { next(e); }
}

export async function createVehicle(req, res, next) {
  try {
    const userId = req.user.id;
    const { make, model, color, energy, seats } = req.body;
    const id = uuidv4();
    await query(
      `INSERT INTO vehicles (id, user_id, make, model, color, energy, seats)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, userId, make, model, color || null, energy, seats]
    );
    res.status(201).json({ data: { id } });
  } catch (e) { next(e); }
}

export async function updateVehicle(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const allowed = ['make','model','color','energy','seats'];
    const fields = [];
    const values = [];
    let i = 1;

    for (const k of allowed) {
      if (k in req.body) {
        fields.push(`${k}=$${++i}`);
        values.push(req.body[k]);
      }
    }
    if (fields.length === 0) return next({ status: 400, message: 'No fields to update' });

    values.unshift(id);
    values.unshift(userId);
    // values = [userId, id, ...updates]

    const { rowCount } = await query(
      `UPDATE vehicles SET ${fields.join(', ')}
       WHERE id=$2 AND user_id=$1`,
      values
    );
    if (!rowCount) return next({ status: 404, message: 'Vehicle not found' });
    res.json({ data: { id } });
  } catch (e) { next(e); }
}

export async function deleteVehicle(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Do not allow delete if used by an upcoming/ongoing trip
    const used = await query(
      `SELECT 1 FROM trips WHERE vehicle_id=$1 AND status IN ('scheduled','started') LIMIT 1`,
      [id]
    );
    if (used.rowCount) return next({ status: 400, message: 'Vehicle used by an active trip' });

    const { rowCount } = await query('DELETE FROM vehicles WHERE id=$1 AND user_id=$2', [id, userId]);
    if (!rowCount) return next({ status: 404, message: 'Vehicle not found' });
    res.json({ data: { id, deleted: true } });
  } catch (e) { next(e); }
}
