import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../../src/config/db.js', () => ({
  query: mockQuery
}));

const { getUserById, updateUser, deleteUser } = await import('../../src/services/users.service.js');

describe('Users Service', () => {

  beforeEach(() => jest.clearAllMocks());

  test('getUserById - retorna usuario encontrado', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Juan', correo: 'j@j.com', rol: 'cliente' }] });
    const result = await getUserById('uuid-123');
    expect(result).toHaveProperty('nombre', 'Juan');
  });

  test('getUserById - retorna undefined si no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await getUserById('uuid-inexistente');
    expect(result).toBeUndefined();
  });

  test('updateUser - actualiza correctamente', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    const result = await updateUser(1, 'Juan', 'j@j.com');
    expect(result).toHaveProperty('message', 'Usuario actualizado correctamente');
  });

  test('updateUser - lanza error si usuario no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    await expect(updateUser(99999, 'x', 'x@x.com')).rejects.toThrow('Usuario no encontrado');
  });

  test('deleteUser - elimina correctamente', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    const result = await deleteUser(1);
    expect(result).toHaveProperty('message', 'Usuario eliminado correctamente');
  });

  test('deleteUser - lanza error si usuario no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    await expect(deleteUser(99999)).rejects.toThrow('Usuario no encontrado');
  });
});