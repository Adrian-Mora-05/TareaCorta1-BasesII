import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock del userDAO inyectado en UserService
const mockUserDAO = {
  findByExternalId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn()
};

const { UserService } = await import('../../src/services/users.service.js');

// Instancia con el DAO mockeado
const userService = new UserService(mockUserDAO);

describe('UserService', () => {

  beforeEach(() => jest.clearAllMocks());

  test('getMe - retorna usuario encontrado', async () => {
    mockUserDAO.findByExternalId.mockResolvedValue({
      id: 1,
      nombre: 'Juan',
      correo: 'j@j.com',
      rol: 'cliente'
    });

    const result = await userService.getMe('uuid-123');
    expect(result).toHaveProperty('nombre', 'Juan');
    expect(mockUserDAO.findByExternalId).toHaveBeenCalledWith('uuid-123');
  });

  test('getMe - retorna null si no existe', async () => {
    mockUserDAO.findByExternalId.mockResolvedValue(null);

    const result = await userService.getMe('uuid-inexistente');
    expect(result).toBeNull();
  });

  test('update - actualiza correctamente', async () => {
    // findById confirma que el usuario existe
    mockUserDAO.findById.mockResolvedValue({ id: 1, nombre: 'Juan', correo: 'j@j.com' });
    mockUserDAO.update.mockResolvedValue({ id: 1, nombre: 'Nuevo', correo: 'nuevo@j.com' });

    const result = await userService.update(1, { nombre: 'Nuevo', correo: 'nuevo@j.com' });
    expect(result).toHaveProperty('nombre', 'Nuevo');
  });

  test('update - lanza error si usuario no existe', async () => {
    mockUserDAO.findById.mockResolvedValue(null);

    await expect(userService.update(99999, { nombre: 'x' }))
      .rejects.toThrow('Usuario no encontrado');
  });

  test('delete - elimina correctamente', async () => {
    mockUserDAO.findById.mockResolvedValue({ id: 1 });
    mockUserDAO.delete.mockResolvedValue(true);

    const result = await userService.delete(1);
    expect(result).toBe(true);
  });

  test('delete - lanza error si usuario no existe', async () => {
    mockUserDAO.findById.mockResolvedValue(null);

    await expect(userService.delete(99999))
      .rejects.toThrow('Usuario no encontrado');
  });

});