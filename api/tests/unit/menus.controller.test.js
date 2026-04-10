import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockCrearMenu = jest.fn();
const mockGetMenuById = jest.fn();
const mockUpdateMenu = jest.fn();
const mockDeleteMenu = jest.fn();

jest.unstable_mockModule('../../src/services/menus.service.js', () => ({
  crearMenu: mockCrearMenu,
  getMenuById: mockGetMenuById,
  updateMenu: mockUpdateMenu,
  deleteMenu: mockDeleteMenu
}));

const { crear, getById, update, remove } = await import('../../src/controllers/menus.controller.js');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Menus Controller - crear', () => {

  beforeEach(() => jest.clearAllMocks());

  test('201 - menú creado correctamente', async () => {
    mockCrearMenu.mockResolvedValue({ id: 1 });
    const req = { body: { nombre: 'Menú del día', id_restaurante: 1 } };
    const res = mockRes();
    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Menú creado correctamente', id: 1 });
  });

  test('400 - faltan campos', async () => {
    const req = { body: { nombre: 'Sin restaurante' } };
    const res = mockRes();
    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('500 - error del servicio', async () => {
    mockCrearMenu.mockRejectedValue(new Error('Error de BD'));
    const req = { body: { nombre: 'Test', id_restaurante: 1 } };
    const res = mockRes();
    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Menus Controller - getById', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - menú encontrado', async () => {
    mockGetMenuById.mockResolvedValue({ id: 1, nombre: 'Menú del día', id_restaurante: 1 });
    const req = { params: { id: '1' } };
    const res = mockRes();
    await getById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test('404 - menú no encontrado', async () => {
    mockGetMenuById.mockResolvedValue(undefined);
    const req = { params: { id: '9999' } };
    const res = mockRes();
    await getById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - error del servicio', async () => {
    mockGetMenuById.mockRejectedValue(new Error('Error de BD'));
    const req = { params: { id: '1' } };
    const res = mockRes();
    await getById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Menus Controller - update', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - menú actualizado', async () => {
    mockGetMenuById.mockResolvedValue({ id: 1 });
    mockUpdateMenu.mockResolvedValue();
    const req = { params: { id: '1' }, body: { nombre: 'Nuevo nombre' } };
    const res = mockRes();
    await update(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Menú actualizado correctamente' });
  });

  test('400 - falta nombre', async () => {
    const req = { params: { id: '1' }, body: {} };
    const res = mockRes();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('404 - menú no encontrado', async () => {
    mockGetMenuById.mockResolvedValue(undefined);
    const req = { params: { id: '9999' }, body: { nombre: 'Test' } };
    const res = mockRes();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - error del servicio', async () => {
    mockGetMenuById.mockRejectedValue(new Error('Error de BD'));
    const req = { params: { id: '1' }, body: { nombre: 'Test' } };
    const res = mockRes();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Menus Controller - remove', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - menú eliminado', async () => {
    mockGetMenuById.mockResolvedValue({ id: 1 });
    mockDeleteMenu.mockResolvedValue();
    const req = { params: { id: '1' } };
    const res = mockRes();
    await remove(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Menú eliminado correctamente' });
  });

  test('404 - menú no encontrado', async () => {
    mockGetMenuById.mockResolvedValue(undefined);
    const req = { params: { id: '9999' } };
    const res = mockRes();
    await remove(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - error del servicio', async () => {
    mockGetMenuById.mockRejectedValue(new Error('Error de BD'));
    const req = { params: { id: '1' } };
    const res = mockRes();
    await remove(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});