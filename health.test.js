import request from 'supertest';
import app from '../app.js';
import { describe, it, expect } from 'vitest';

describe('Healthcheck', () => {
  it('GET /api/health => 200 { ok: true }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body?.ok).toBe(true);
  });
});
