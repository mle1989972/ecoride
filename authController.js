import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export async function register(req, res, next) {
  try {
    const { pseudo, email, password } = req.body;
    const exists = await query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (exists.rowCount) return next({ status: 409, message: 'Email already used' });

    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users (id, email, pseudo, password_hash, role, credits)
       VALUES ($1,$2,$3,$4,'user',20)`,
      [id, email, pseudo, hash]
    );

    res.status(201).json({ data: { id, email, pseudo } });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { rows, rowCount } = await query(
      'SELECT id, pseudo, role, password_hash, is_suspended FROM users WHERE email=$1',
      [email]
    );
    if (!rowCount) return next({ status: 401, message: 'Invalid credentials' });
    const u = rows[0];
    if (u.is_suspended) return next({ status: 403, message: 'Account suspended' });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return next({ status: 401, message: 'Invalid credentials' });

    const token = jwt.sign({ id: u.id, role: u.role, pseudo: u.pseudo }, process.env.JWT_SECRET, { expiresIn: '2d' });
    res.json({ data: { token, user: { id: u.id, email, pseudo: u.pseudo, role: u.role } } });
  } catch (e) { next(e); }
}
