import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockDAO = {
  createFromKeycloak: jest.fn()
};

const { AuthService } = await import('../../src/services/auth.service.js');

const service = new AuthService(mockDAO);

function mockFetchOk(data) {
  return { ok: true, json: jest.fn().mockResolvedValue(data), text: jest.fn().mockResolvedValue(JSON.stringify(data)) };
}

function mockFetchFail(data) {
  return { ok: false, status: 400, json: jest.fn().mockResolvedValue(data), text: jest.fn().mockResolvedValue(JSON.stringify(data)) };
}

describe('AuthService - register', () => {

  beforeEach(() => jest.clearAllMocks());

  test('register → éxito', async () => {
    mockFetch
      .mockResolvedValueOnce(mockFetchOk({ access_token: 'admin-token' })) // admin token
      .mockResolvedValueOnce({ ok: true, json: jest.fn() })                // create user
      .mockResolvedValueOnce(mockFetchOk([{ id: 'kc-id' }]))              // get user
      .mockResolvedValueOnce(mockFetchOk({ id: 'role-id', name: 'cliente' })) // get role
      .mockResolvedValueOnce({ ok: true, json: jest.fn() });               // assign role

    mockDAO.createFromKeycloak.mockResolvedValue({ id: 1 });

    const result = await service.register({
      username: 'test',
      email: 'a@a.com',
      firstName: 'A',
      lastName: 'B',
      password: '123'
    });

    expect(result).toBe(true);
    expect(mockDAO.createFromKeycloak).toHaveBeenCalledWith({
      keycloakId: 'kc-id',
      nombre: 'A B',
      correo: 'a@a.com',
      rol: 'cliente'
    });
  });

  test('register → lanza error si Keycloak falla al crear usuario', async () => {
    mockFetch
      .mockResolvedValueOnce(mockFetchOk({ access_token: 'admin-token' }))
      .mockResolvedValueOnce(mockFetchFail({ errorMessage: 'User exists already' }));

    await expect(service.register({
      username: 'test',
      email: 'a@a.com',
      firstName: 'A',
      lastName: 'B',
      password: '123'
    })).rejects.toThrow('User exists already');
  });

  test('register → lanza error si no se obtiene ID del usuario', async () => {
    mockFetch
      .mockResolvedValueOnce(mockFetchOk({ access_token: 'admin-token' }))
      .mockResolvedValueOnce({ ok: true, json: jest.fn() })
      .mockResolvedValueOnce(mockFetchOk([])); // lista vacía — sin ID

    await expect(service.register({
      username: 'test',
      email: 'a@a.com',
      firstName: 'A',
      lastName: 'B',
      password: '123'
    })).rejects.toThrow('No se pudo obtener el ID del usuario creado');
  });

  test('register → lanza error si el rol no existe en Keycloak', async () => {
    mockFetch
      .mockResolvedValueOnce(mockFetchOk({ access_token: 'admin-token' }))
      .mockResolvedValueOnce({ ok: true, json: jest.fn() })
      .mockResolvedValueOnce(mockFetchOk([{ id: 'kc-id' }]))
      .mockResolvedValueOnce(mockFetchFail({})); // rol no encontrado

    await expect(service.register({
      username: 'test',
      email: 'a@a.com',
      firstName: 'A',
      lastName: 'B',
      password: '123',
      role: 'inexistente' // se convierte a 'cliente' internamente
    })).rejects.toThrow("Rol 'cliente' no encontrado en Keycloak");
  });

});

describe('AuthService - login', () => {

  beforeEach(() => jest.clearAllMocks());

  test('login → retorna token en login exitoso', async () => {
    mockFetch.mockResolvedValueOnce(
      mockFetchOk({ access_token: 'token-123', expires_in: 300 })
    );

    const result = await service.login('juan', '123456');

    expect(result).toHaveProperty('access_token', 'token-123');
  });

  test('login → lanza error si credenciales son inválidas', async () => {
    mockFetch.mockResolvedValueOnce(
      mockFetchFail({ error: 'invalid_grant' })
    );

    await expect(service.login('juan', 'mal'))
      .rejects.toThrow('Credenciales inválidas');
  });

});