import request from 'supertest';
import app from '../app.js';
import { describe, it, expect } from 'vitest';

function randomEmail() {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `test+${rnd}@example.com`;
}

describe('Auth', () => {
  it('POST /api/auth/register puis /api/auth/login', async () => {
    const email = randomEmail();
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ pseudo: 'TestUser', email, password: 'Password123!' });
    expect(reg.status).toBe(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });
    expect(login.status).toBe(200);
    expect(login.body?.data?.token).toBeTruthy();
  });
});
