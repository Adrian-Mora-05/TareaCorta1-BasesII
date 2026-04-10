import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../../src/config/db.js', () => ({
  query: mockQuery
}));

const { createReservation, cancelReservation } = await import('../../src/services/reservations.service.js');

describe('Reservations Service', () => {

  beforeEach(() => jest.clearAllMocks());

  test('createReservation - lanza error si usuario no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // usuario no encontrado
    await expect(createReservation('uuid-xxx', 1, 1, '2027-01-01', 90, 4))
      .rejects.toThrow('Usuario no encontrado en base de datos');
  });

  test('createReservation - crea reserva correctamente', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // usuario encontrado
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] }); // reservar()
    const result = await createReservation('uuid-123', 1, 1, '2027-01-01', 90, 4);
    expect(result).toHaveProperty('id', 42);
  });

  test('cancelReservation - cancela correctamente', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }); // existe
    mockQuery.mockResolvedValueOnce({ rows: [] }); // cancelar_reserva
    await expect(cancelReservation(1)).resolves.toBeUndefined();
  });

  test('cancelReservation - lanza error si reserva no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    await expect(cancelReservation(99999)).rejects.toThrow('Reserva no encontrada');
  });
});