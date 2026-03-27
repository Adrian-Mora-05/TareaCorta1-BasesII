import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockCreateOrder = jest.fn();
const mockGetOrderById = jest.fn();

jest.unstable_mockModule('../../src/services/orders.service.js', () => ({
  createOrder: mockCreateOrder,
  getOrderById: mockGetOrderById
}));

const { create, getById } = await import('../../src/controllers/orders.controller.js');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Orders Controller - create', () => {

  beforeEach(() => jest.clearAllMocks());

  test('201 - pedido creado', async () => {
    mockCreateOrder.mockResolvedValue({ id: 1 });
    const req = {
      auth: { sub: 'uuid-123' },
      body: { id_restaurante: 1, descripcion: 'Para llevar', id_tipo_pedido: 1, platos: [{ id_plato: 1, cantidad: 2 }] }
    };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pedido creado correctamente', id: 1 });
  });

  test('400 - datos incompletos', async () => {
    const req = { auth: { sub: 'uuid-123' }, body: { id_restaurante: 1 } };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 - platos vacíos', async () => {
    const req = { auth: { sub: 'uuid-123' }, body: { id_restaurante: 1, id_tipo_pedido: 1, platos: [] } };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 - plato no existe', async () => {
    mockCreateOrder.mockRejectedValue(new Error('Plato 9999 no existe'));
    const req = {
      auth: { sub: 'uuid-123' },
      body: { id_restaurante: 1, id_tipo_pedido: 1, platos: [{ id_plato: 9999, cantidad: 1 }] }
    };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('500 - result sin id', async () => {
    mockCreateOrder.mockResolvedValue(null);
    const req = {
      auth: { sub: 'uuid-123' },
      body: { id_restaurante: 1, id_tipo_pedido: 1, platos: [{ id_plato: 1, cantidad: 1 }] }
    };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('500 - error inesperado', async () => {
    mockCreateOrder.mockRejectedValue(new Error('Error de BD'));
    const req = {
      auth: { sub: 'uuid-123' },
      body: { id_restaurante: 1, id_tipo_pedido: 1, platos: [{ id_plato: 1, cantidad: 1 }] }
    };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Orders Controller - getById', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - pedido encontrado', async () => {
    mockGetOrderById.mockResolvedValue({ id: 1, usuario: 1, restaurante: 1 });
    const req = { params: { id: '1' } };
    const res = mockRes();
    await getById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test('404 - pedido no encontrado', async () => {
    mockGetOrderById.mockResolvedValue(undefined);
    const req = { params: { id: '9999' } };
    const res = mockRes();
    await getById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - error del servicio', async () => {
    mockGetOrderById.mockRejectedValue(new Error('Error de BD'));
    const req = { params: { id: '1' } };
    const res = mockRes();
    await getById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});