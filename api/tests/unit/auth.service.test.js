import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock query
const mockQuery = jest.fn();
jest.unstable_mockModule('../../src/config/db.js', () => ({
  query: mockQuery
}));

const { registrarUsuario, loginUser } = await import('../../src/services/auth.service.js');

function mockFetchResponse(ok, data) {
  return {
    ok,
    status: ok ? 200 : 400,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data))
  };
}

describe('Auth Service - registrarUsuario', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    // Admin token
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, { access_token: 'admin-token' }));
  });

  test('registra usuario correctamente', async () => {
    // crear usuario en keycloak
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));
    // obtener usuario creado
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, [{ id: 'kc-uuid-123' }]));
    // obtener rol
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, { id: 'rol-id', name: 'cliente' }));
    // asignar rol
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));

    // query para obtener id del rol en BD
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    // insert usuario en BD
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await registrarUsuario({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    });

    expect(result).toBe(true);
  });

  test('lanza error si Keycloak falla al crear usuario', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse(false, { errorMessage: 'User exists' }));

    await expect(registrarUsuario({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    })).rejects.toThrow('User exists');
  });

  test('lanza error si no se obtiene el ID del usuario creado', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));   // crear OK
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, []));   // lista vacía → sin ID

    await expect(registrarUsuario({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    })).rejects.toThrow('No se pudo obtener el ID del usuario creado');
  });

  test('lanza error si el rol no existe en Keycloak', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));              // crear OK
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, [{ id: 'kc-uuid' }])); // get user OK
    mockFetch.mockResolvedValueOnce(mockFetchResponse(false, {}));             // rol no encontrado

    await expect(registrarUsuario({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456',
      role: 'inexistente'
    })).rejects.toThrow("Rol 'inexistente' no encontrado en Keycloak");
  });

  test('lanza error si el rol no existe en BD', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, [{ id: 'kc-uuid' }]));
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, { id: 'rol-id', name: 'cliente' }));
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));

    mockQuery.mockResolvedValueOnce({ rows: [] }); // rol no encontrado en BD

    await expect(registrarUsuario({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    })).rejects.toThrow("Rol 'cliente' no encontrado en base de datos");
  });
});

describe('Auth Service - loginUser', () => {

  beforeEach(() => jest.clearAllMocks());

  test('retorna token en login exitoso', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, { access_token: 'token-123', expires_in: 300 }));

    const result = await loginUser('juan', '123456');
    expect(result).toHaveProperty('access_token', 'token-123');
  });

  test('lanza error si las credenciales son inválidas', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse(false, { error: 'invalid_grant' }));

    await expect(loginUser('juan', 'mal')).rejects.toThrow('Credenciales inválidas');
  });
});

describe('Auth Service - getAdminToken retries', () => {

  beforeEach(() => jest.clearAllMocks());

  test('lanza error si Keycloak no responde después de todos los reintentos', async () => {
    // Simula fallo en todos los intentos
    mockFetch.mockRejectedValue(new Error('Connection refused'));

    await expect(registrarUsuario({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    })).rejects.toThrow('Could not connect to Keycloak after multiple retries');
  }, 60000); // timeout alto porque reintenta 10 veces con delay

  test('lanza error si Keycloak responde con error en token admin', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ error: 'unauthorized' }),
      text: jest.fn().mockResolvedValue('unauthorized')
    });

    await expect(registrarUsuario({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    })).rejects.toThrow('Could not connect to Keycloak after multiple retries');
  }, 60000);
});