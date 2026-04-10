import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockGetUserById = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();

jest.unstable_mockModule('../../src/services/users.service.js', () => ({
  getUserById: mockGetUserById,
  updateUser: mockUpdateUser,
  deleteUser: mockDeleteUser
}));

const { getMe, update, remove } = await import('../../src/controllers/users.controller.js');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Users Controller - getMe', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - usuario encontrado', async () => {
    mockGetUserById.mockResolvedValue({ id: 1, nombre: 'Juan', correo: 'j@j.com', rol: 'cliente' });
    const req = { auth: { sub: 'uuid-123' } };
    const res = mockRes();
    await getMe(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('404 - usuario no encontrado', async () => {
    mockGetUserById.mockResolvedValue(undefined);
    const req = { auth: { sub: 'uuid-inexistente' } };
    const res = mockRes();
    await getMe(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - error del servicio', async () => {
    mockGetUserById.mockRejectedValue(new Error('Error de BD'));
    const req = { auth: { sub: 'uuid-123' } };
    const res = mockRes();
    await getMe(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Users Controller - update', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - actualización exitosa', async () => {
    mockUpdateUser.mockResolvedValue({ message: 'Usuario actualizado correctamente' });
    const req = { params: { id: '1' }, body: { nombre: 'Nuevo', correo: 'nuevo@test.com' } };
    const res = mockRes();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('400 - faltan campos', async () => {
    const req = { params: { id: '1' }, body: { nombre: 'Solo nombre' } };
    const res = mockRes();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('404 - usuario no existe', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Usuario no encontrado'));
    const req = { params: { id: '9999' }, body: { nombre: 'x', correo: 'x@x.com' } };
    const res = mockRes();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - error inesperado', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Error de BD'));
    const req = { params: { id: '1' }, body: { nombre: 'x', correo: 'x@x.com' } };
    const res = mockRes();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Users Controller - remove', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - eliminación exitosa', async () => {
    mockDeleteUser.mockResolvedValue({ message: 'Usuario eliminado correctamente' });
    const req = { params: { id: '1' } };
    const res = mockRes();
    await remove(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('404 - usuario no existe', async () => {
    mockDeleteUser.mockRejectedValue(new Error('Usuario no encontrado'));
    const req = { params: { id: '9999' } };
    const res = mockRes();
    await remove(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - error inesperado', async () => {
    mockDeleteUser.mockRejectedValue(new Error('Error de BD'));
    const req = { params: { id: '1' } };
    const res = mockRes();
    await remove(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});