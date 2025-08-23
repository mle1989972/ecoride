import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { send } from '../emails/mailer.js';

export async function createEmployee(req, res, next) {
  try {
    const { email, pseudo, password } = req.body;

    const exists = await query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (exists.rowCount) return next({ status: 409, message: 'Email already used' });

    const id = uuidv4();
    const pwd = password || Math.random().toString(36).slice(2, 10) + 'A1!';
    const hash = await bcrypt.hash(pwd, 10);

    await query(
      `INSERT INTO users (id, email, pseudo, password_hash, role, credits)
       VALUES ($1,$2,$3,$4,'employee',20)`,
      [id, email, pseudo, hash]
    );

    // best-effort email
    await send(email, 'EcoRide — Compte Employé créé', `<p>Bonjour ${pseudo},</p><p>Votre compte employé a été créé.<br>Email : ${email}<br>Mot de passe : <b>${pwd}</b></p>`);

    res.status(201).json({ data: { id, email, pseudo, role: 'employee' } });
  } catch (e) { next(e); }
}

export async function suspendUser(req, res, next) {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;
    const { reason = 'suspension', end_date = null } = req.body || {};

    const u = await query('SELECT 1 FROM users WHERE id=$1', [userId]);
    if (!u.rowCount) return next({ status: 404, message: 'User not found' });

    await query('UPDATE users SET is_suspended=true WHERE id=$1', [userId]);
    await query(
      `INSERT INTO suspensions (user_id, reason, end_date, created_by) VALUES ($1,$2,$3,$4)`,
      [userId, reason, end_date, adminId]
    );

    res.json({ data: { userId, is_suspended: true } });
  } catch (e) { next(e); }
}

export async function getStats(_req, res, next) {
  try {
    const trips = (await query(
      `SELECT date_trunc('day', departure_time)::date AS day, COUNT(*) AS trips
       FROM trips
       WHERE departure_time >= (CURRENT_DATE - INTERVAL '30 days')
       GROUP BY 1
       ORDER BY 1`
    )).rows;

    const credits = (await query(
      `SELECT date_trunc('day', created_at)::date AS day, SUM(GREATEST(delta,0)) AS credits_gained
       FROM credits_ledger
       WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days')
       GROUP BY 1
       ORDER BY 1`
    )).rows;

    const totalCredits = (await query(
      `SELECT COALESCE(SUM(delta),0) AS total FROM credits_ledger`
    )).rows[0].total;

    res.json({ data: { trips, credits, totalCredits } });
  } catch (e) { next(e); }
}
