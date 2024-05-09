import request from 'supertest';
import { app } from '../src/indexApp.js';

describe('POST /users', () => {
  it('Should successfully create a new user', async () => {
    await request(app).post('/users').send({
      name: "Eduardo Segredo",
      username: "esegredo",
      email: "esegredo@example.com",
    }).expect(201);
  });
});