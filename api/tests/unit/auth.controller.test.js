import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockRegistrarUsuario = jest.fn();
const mockLoginUser = jest.fn();

jest.unstable_mockModule('../../src/services/auth.service.js', () => ({
  registrarUsuario: mockRegistrarUsuario,
  loginUser: mockLoginUser
}));

const { register, login } = await import('../../src/controllers/auth.controller.js');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Auth Controller - register', () => {

  beforeEach(() => jest.clearAllMocks());

  test('201 - registro exitoso', async () => {
    mockRegistrarUsuario.mockResolvedValue(true);
    const req = {
      body: { username: 'juan', email: 'j@j.com', password: '123', firstName: 'Juan', lastName: 'Pérez' },
      auth: null
    };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado correctamente' });
  });

  test('400 - faltan campos obligatorios', async () => {
    const req = { body: { username: 'juan' }, auth: null };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('403 - cliente intenta crear admin', async () => {
    const req = {
      body: { username: 'hack', email: 'h@h.com', password: '123', role: 'admin' },
      auth: { roles: ['cliente'] }
    };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('500 - error del servicio', async () => {
    mockRegistrarUsuario.mockRejectedValue(new Error('Error de Keycloak'));
    const req = { body: { username: 'juan', email: 'j@j.com', password: '123' }, auth: null };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Auth Controller - login', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - login exitoso', async () => {
    mockLoginUser.mockResolvedValue({ access_token: 'fake-token' });
    const req = { body: { username: 'juan', password: '123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ access_token: 'fake-token' });
  });

  test('400 - faltan credenciales', async () => {
    const req = { body: { username: 'juan' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('401 - credenciales inválidas', async () => {
    mockLoginUser.mockRejectedValue(new Error('Credenciales inválidas'));
    const req = { body: { username: 'juan', password: 'mal' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});