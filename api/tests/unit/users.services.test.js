import { jest } from '@jest/globals';
//import { UsersService } from '../../src/services/users.service.js';
const { UserService } = await import('../../src/services/users.service.js');
describe('UsersService', () => {

  let mockDAO;
  let service;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock del DAO
    mockDAO = {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    service = new UsersService(mockDAO);
  });

  // ─────────────────────────────────────────
  // GET USER
  // ─────────────────────────────────────────
  test('getById → retorna usuario', async () => {
    mockDAO.findById.mockResolvedValue({
      id: 1,
      nombre: 'Juan'
    });

    const result = await service.getById('uuid-123');

    expect(mockDAO.findById).toHaveBeenCalledWith('uuid-123');
    expect(result).toEqual({ id: 1, nombre: 'Juan' });
  });

  test('getById → usuario no existe', async () => {
    mockDAO.findById.mockResolvedValue(null);

    const result = await service.getById('uuid-x');

    expect(result).toBeNull();
  });

  // ─────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────
  test('update → éxito', async () => {
    mockDAO.update.mockResolvedValue(true);

    const result = await service.update('1', {
      nombre: 'Nuevo',
      correo: 'nuevo@test.com'
    });

    expect(mockDAO.update).toHaveBeenCalledWith('1', {
      nombre: 'Nuevo',
      correo: 'nuevo@test.com'
    });

    expect(result).toBe(true);
  });

  test('update → error si faltan campos', async () => {
    await expect(
      service.update('1', {})
    ).rejects.toThrow();
  });

  // ─────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────
  test('delete → éxito', async () => {
    mockDAO.delete.mockResolvedValue(true);

    const result = await service.delete('1');

    expect(mockDAO.delete).toHaveBeenCalledWith('1');
    expect(result).toBe(true);
  });

  test('delete → usuario no existe', async () => {
    mockDAO.delete.mockResolvedValue(false);

    const result = await service.delete('99');

    expect(result).toBe(false);
  });

});