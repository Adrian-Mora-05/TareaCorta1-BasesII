import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock fetch global para simular Keycloak
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock del userDAO que se inyecta en AuthService
const mockUserDAO = {
  createFromKeycloak: jest.fn(),
  findByExternalId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const { AuthService } = await import('../../src/services/auth.service.js');

// Crea una instancia de AuthService con el DAO mockeado
const authService = new AuthService(mockUserDAO);

function mockFetchResponse(ok, data) {
  return {
    ok,
    status: ok ? 200 : 400,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data))
  };
}

describe('AuthService - register', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Admin token — primer fetch de cada prueba
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, { access_token: 'admin-token' }));
  });

  test('registra usuario correctamente', async () => {
    // Crear usuario en Keycloak
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));
    // Obtener usuario creado
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, [{ id: 'kc-uuid-123' }]));
    // Obtener rol
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, { id: 'rol-id', name: 'cliente' }));
    // Asignar rol
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));
    // createFromKeycloak no lanza error
    mockUserDAO.createFromKeycloak.mockResolvedValue({ id: 1 });

    const result = await authService.register({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    });

    expect(result).toBe(true);
    expect(mockUserDAO.createFromKeycloak).toHaveBeenCalledWith({
      keycloakId: 'kc-uuid-123',
      nombre: 'Juan Pérez',
      correo: 'juan@test.com',
      rol: 'cliente'
    });
  });

  test('lanza error si Keycloak falla al crear usuario', async () => {
    mockFetch.mockResolvedValueOnce(
      mockFetchResponse(false, { errorMessage: 'User exists already' })
    );

    await expect(authService.register({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    })).rejects.toThrow('User exists already');
  });

  test('lanza error si no se obtiene el ID del usuario creado', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));
    // Lista vacía — no hay ID
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, []));

    await expect(authService.register({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456'
    })).rejects.toThrow('No se pudo obtener el ID del usuario creado');
  });

  test('lanza error si el rol no existe en Keycloak', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, {}));
    mockFetch.mockResolvedValueOnce(mockFetchResponse(true, [{ id: 'kc-uuid' }]));
    // Rol no encontrado
    mockFetch.mockResolvedValueOnce(mockFetchResponse(false, {}));

    await expect(authService.register({
      username: 'juan',
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      password: '123456',
      role: 'inexistente'
    })).rejects.toThrow("Rol 'inexistente' no encontrado en Keycloak");
  });

});

describe('AuthService - login', () => {

  beforeEach(() => jest.clearAllMocks());

  test('retorna token en login exitoso', async () => {
    mockFetch.mockResolvedValueOnce(
      mockFetchResponse(true, { access_token: 'token-123', expires_in: 300 })
    );

    const result = await authService.login('juan', '123456');
    expect(result).toHaveProperty('access_token', 'token-123');
  });

  test('lanza error si las credenciales son inválidas', async () => {
    mockFetch.mockResolvedValueOnce(
      mockFetchResponse(false, { error: 'invalid_grant' })
    );

    await expect(authService.login('juan', 'mal')).rejects.toThrow('Credenciales inválidas');
  });

});