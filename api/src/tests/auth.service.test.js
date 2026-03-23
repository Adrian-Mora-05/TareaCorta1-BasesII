// Importa jest para poder usar jest.fn() y otras utilidades de mock
import { jest } from '@jest/globals';

// fetch es la función que usa auth.service.js para llamar a Keycloak
// Al mockearla, evitamos hacer llamadas reales a Keycloak durante las pruebas
global.fetch = jest.fn();

// Importa la función a probar DESPUÉS de configurar el mock
import { loginUser } from '../services/auth.service.js';

// Agrupa todas las pruebas relacionadas con auth.service
describe('auth.service', () => {

  // Antes de cada prueba limpia el historial del mock
  // Esto evita que las llamadas de una prueba afecten a la siguiente
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Prueba el caso exitoso: credenciales correctas devuelven un token
  test('loginUser devuelve un token con credenciales correctas', async () => {

    // Configura el mock para simular que Keycloak responde exitosamente
    // mockResolvedValue define qué devuelve fetch cuando se llama
    // ok: true simula una respuesta HTTP 200
    global.fetch.mockResolvedValue({
      ok: true,
      // json() es el método que llama auth.service.js para leer la respuesta
      json: async () => ({
        access_token: 'token-falso-123',
        token_type: 'Bearer',
        expires_in: 300
      })
    });

    // Llama a la función real con credenciales de prueba
    const result = await loginUser('admin1', 'admin123');

    // Verifica que la respuesta tiene un access_token
    expect(result).toHaveProperty('access_token');
    // Verifica que el tipo de token es exactamente 'Bearer'
    expect(result.token_type).toBe('Bearer');
  });

  // Prueba el caso de error: credenciales incorrectas lanzan una excepción
  test('loginUser lanza error con credenciales incorrectas', async () => {

    // Simula que Keycloak responde con error HTTP
    // ok: false simula una respuesta HTTP 401
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'invalid_grant' })
    });

    // rejects verifica que la promesa fue rechazada (lanzó un error)
    // toThrow verifica que el mensaje del error es exactamente ese
    await expect(loginUser('usuario_falso', 'clave_falsa'))
      .rejects
      .toThrow('Credenciales inválidas');
  });

});