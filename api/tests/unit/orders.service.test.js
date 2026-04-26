import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../../src/config/postgresdb.js', () => ({
  query: mockQuery
}));

const { createOrder, getOrderById } = await import('../../src/services/orders.service.js');

describe('Orders Service', () => {

  beforeEach(() => jest.clearAllMocks());

  test('createOrder - crea pedido correctamente', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });           // usuario encontrado
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }); // restaurante existe
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] });          // realizar_pedido

    const result = await createOrder('uuid-123', 1, 'Para llevar', 1, [{ id_plato: 1, cantidad: 2 }]);
    expect(result).toHaveProperty('id', 42);
  });

  test('createOrder - lanza error si usuario no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // usuario no encontrado

    await expect(createOrder('uuid-xxx', 1, 'desc', 1, [])).rejects.toThrow('Usuario no encontrado en base de datos');
  });

  test('createOrder - lanza error si restaurante no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // usuario OK
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });        // restaurante no existe

    await expect(createOrder('uuid-123', 99999, 'desc', 1, [])).rejects.toThrow('no existe');
  });

  test('createOrder - lanza error si realizar_pedido no retorna id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    mockQuery.mockResolvedValueOnce({ rows: [{}] }); // sin id

    await expect(createOrder('uuid-123', 1, 'desc', 1, [])).rejects.toThrow('No se pudo crear el pedido');
  });

  test('getOrderById - retorna pedido encontrado', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, descripcion: 'Para llevar' }] });
    const result = await getOrderById(1);
    expect(result).toHaveProperty('id', 1);
  });

  test('getOrderById - retorna undefined si no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await getOrderById(99999);
    expect(result).toBeUndefined();
  });
});