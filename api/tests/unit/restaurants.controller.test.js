import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockRegistrarRestaurante = jest.fn();
const mockListarRestaurantes = jest.fn();

jest.unstable_mockModule('../../src/services/restaurants.service.js', () => ({
  registrarRestaurante: mockRegistrarRestaurante,
  listarRestaurantes: mockListarRestaurantes
}));

const { crear, listar } = await import('../../src/controllers/restaurants.controller.js');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Restaurants Controller - crear', () => {

  beforeEach(() => jest.clearAllMocks());

  test('201 - restaurante creado correctamente', async () => {
    mockRegistrarRestaurante.mockResolvedValue({ id: 1 });
    const req = { body: { nombre: 'La Trattoria', direccion: 'Calle 5', telefono: '2222-3333' } };
    const res = mockRes();
    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Restaurante registrado correctamente', id: 1 });
  });

  test('400 - falta nombre', async () => {
    const req = { body: { direccion: 'Calle 5' } };
    const res = mockRes();
    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('500 - error del servicio', async () => {
    mockRegistrarRestaurante.mockRejectedValue(new Error('Error de BD'));
    const req = { body: { nombre: 'Test' } };
    const res = mockRes();
    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Restaurants Controller - listar', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - lista restaurantes correctamente', async () => {
    mockListarRestaurantes.mockResolvedValue([{ id: 1, nombre: 'La Trattoria' }]);
    const req = {};
    const res = mockRes();
    await listar(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('200 - lista vacía', async () => {
    mockListarRestaurantes.mockResolvedValue([]);
    const req = {};
    const res = mockRes();
    await listar(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('500 - error del servicio', async () => {
    mockListarRestaurantes.mockRejectedValue(new Error('Error de BD'));
    const req = {};
    const res = mockRes();
    await listar(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});