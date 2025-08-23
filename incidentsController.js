import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { logEvent } from '../mongo/log.js';

export async function createIncident(req, res, next) {
  try {
    const reporter_id = req.user.id;
    const { trip_id, summary, description } = req.body;

    // Check trip exists and reporter was involved (driver or accepted passenger), optional: relax if not required
    const t = await query('SELECT driver_id FROM trips WHERE id=$1', [trip_id]);
    if (!t.rowCount) return next({ status: 404, message: 'Trip not found' });

    const involved = await query(
      `SELECT 1 FROM trip_participants WHERE trip_id=$1 AND user_id=$2 AND status='accepted'`,
      [trip_id, reporter_id]
    );
    const isDriver = t.rows[0].driver_id === reporter_id;
    if (!isDriver && !involved.rowCount) {
      return next({ status: 403, message: 'Not a participant of this trip' });
    }

    const id = uuidv4();
    await query(
      `INSERT INTO incidents (id, trip_id, reporter_id, summary, description, status)
       VALUES ($1,$2,$3,$4,$5,'open')`,
      [id, trip_id, reporter_id, summary, description || null]
    );

    // NoSQL log
    logEvent('incident.created', { id, trip_id, reporter_id }).catch(()=>{});

    res.status(201).json({ data: { id, status: 'open' } });
  } catch (e) { next(e); }
}

export async function listIncidents(req, res, next) {
  try {
    const user = req.user;
    const { status } = req.query;

    let sql = `SELECT i.*, u.pseudo AS reporter_pseudo, t.origin_city, t.destination_city, t.departure_time
               FROM incidents i
               JOIN users u ON u.id=i.reporter_id
               JOIN trips t ON t.id=i.trip_id`;
    const where = [];
    const params = [];
    let i = 0;

    if (!(user.role === 'employee' || user.role === 'admin')) {
      where.push(`i.reporter_id = $${++i}`);
      params.push(user.id);
    }
    if (status) {
      where.push(`i.status = $${++i}`);
      params.push(status);
    }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY i.created_at DESC';

    const { rows } = await query(sql, params);
    res.json({ data: rows });
  } catch (e) { next(e); }
}

export async function updateIncidentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const r = await query('UPDATE incidents SET status=$1 WHERE id=$2 RETURNING id, status', [status, id]);
    if (!r.rowCount) return next({ status: 404, message: 'Incident not found' });

    // NoSQL log
    logEvent('incident.updated', { id, status, by: req.user.id }).catch(()=>{});

    res.json({ data: r.rows[0] });
  } catch (e) { next(e); }
}
