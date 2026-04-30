import { jest, describe, test, expect } from '@jest/globals';

const mockRegistrarUsuario = jest.fn().mockResolvedValue(true);
const mockLoginUser = jest.fn().mockResolvedValue({ access_token: 'fake-token', expires_in: 300 });

jest.unstable_mockModule('../../src/middlewares/auth.js', () => ({
  checkJwt: (req, res, next) => { req.auth = { sub: 'test-uuid', roles: ['admin'] }; next(); },
  optionalJwt: (req, res, next) => { req.auth = null; next(); }
}));

// Mockea Redis para que no falle en el pipeline
jest.unstable_mockModule('../../src/config/redis.js', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    on: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/services/auth.service.js', () => ({
  registrarUsuario: mockRegistrarUsuario,
  loginUser: mockLoginUser
}));


const { query } = await import('../../src/config/postgresdb.js');
const { default: request } = await import('supertest');

describe('Auth Integration', () => {

  test('POST /auth/register - 201 registro exitoso', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'integtest', email: 'integ@test.com', firstName: 'Integ', lastName: 'Test', password: 'pass123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Usuario registrado correctamente');
  });

  test('POST /auth/register - 400 faltan campos', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'solo' });
    expect(res.status).toBe(400);
  });

  test('POST /auth/login - 200 login exitoso', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin2', password: 'admin456' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });

  test('POST /auth/login - 400 faltan credenciales', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin2' });
    expect(res.status).toBe(400);
  });
});