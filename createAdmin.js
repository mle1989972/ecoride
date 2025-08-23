import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function arg(name, fallback = null) {
  const i = process.argv.findIndex(a => a.startsWith(`--${name}=`));
  return i >= 0 ? process.argv[i].split('=')[1] : fallback;
}

const email = arg('email') || 'admin@ecoride.local';
const pseudo = arg('pseudo') || 'Admin';
const password = arg('password') || 'Admin123!';

(async () => {
  try {
    const ex = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (ex.rowCount) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }
    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (id, email, pseudo, password_hash, role, credits)
       VALUES ($1,$2,$3,$4,'admin',100)`,
      [id, email, pseudo, hash]
    );
    console.log('Admin created:', { id, email, pseudo, password });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
