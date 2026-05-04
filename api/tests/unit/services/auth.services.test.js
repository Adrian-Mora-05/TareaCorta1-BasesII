import { jest } from '@jest/globals';
import { AuthService } from '../../src/services/auth.service.js';

global.fetch = jest.fn();

describe('Auth Service', () => {

  const mockDAO = {
    createFromKeycloak: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register → éxito', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'admin-token' })
    });

    fetch.mockResolvedValueOnce({ ok: true }); // create user
    fetch.mockResolvedValueOnce({
      json: async () => [{ id: 'kc-id' }]
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'role-id', name: 'cliente' })
    });
    fetch.mockResolvedValueOnce({ ok: true });

    const service = new AuthService(mockDAO);

    const result = await service.register({
      username: 'test',
      email: 'a@a.com',
      firstName: 'A',
      lastName: 'B',
      password: '123'
    });

    expect(result).toBe(true);
    expect(mockDAO.createFromKeycloak).toHaveBeenCalled();
  });

});