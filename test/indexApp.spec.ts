import 'mocha';
import request from 'supertest';
import { app }  from '../src/indexApp.js';

describe('GET /customers', () => {
  it('Should successfully create a new user', async () => {
    await request(app).get('/customers').expect(201);
  });
});