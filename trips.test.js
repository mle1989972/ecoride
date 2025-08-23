import request from 'supertest';
import app from '../app.js';
import { describe, it, expect } from 'vitest';

describe('Trips search', () => {
  it('GET /api/trips?from=Rouen&to=Paris&date=2025-01-01 (format ok)', async () => {
    const res = await request(app).get('/api/trips')
      .query({ from: 'Rouen', to: 'Paris', date: '2025-01-01' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
