import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockCreateReservation = jest.fn();
const mockCancelReservation = jest.fn();

jest.unstable_mockModule('../../src/services/reservations.service.js', () => ({
  createReservation: mockCreateReservation,
  cancelReservation: mockCancelReservation
}));

const { create, remove } = await import('../../src/controllers/reservations.controller.js');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Reservations Controller - create', () => {

  beforeEach(() => jest.clearAllMocks());

  test('201 - reserva creada', async () => {
    mockCreateReservation.mockResolvedValue({ id: 1 });
    const req = {
      auth: { sub: 'uuid-123' },
      body: { id_restaurante: 1, id_mesa: 1, fecha_hora: '2026-04-01T19:00:00', duracion: 90, cant_personas: 4 }
    };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Reserva creada correctamente', id: 1 });
  });

  test('400 - faltan datos', async () => {
    const req = { auth: { sub: 'uuid-123' }, body: { id_restaurante: 1 } };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('409 - conflicto de horario', async () => {
    mockCreateReservation.mockRejectedValue(new Error('La mesa ya está reservada en ese horario'));
    const req = {
      auth: { sub: 'uuid-123' },
      body: { id_restaurante: 1, id_mesa: 1, fecha_hora: '2026-04-01T19:00:00', duracion: 90, cant_personas: 4 }
    };
    const res = mockRes();
    await create(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

test('500 - error del servicio', async () => {
  mockCancelReservation.mockRejectedValue(new Error('Error inesperado de BD')); 
  const req = { params: { id: '9999' } };
  const res = mockRes();
  await remove(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
});

});

describe('Reservations Controller - remove', () => {

  beforeEach(() => jest.clearAllMocks());

  test('200 - reserva cancelada', async () => {
    mockCancelReservation.mockResolvedValue();
    const req = { params: { id: '1' } };
    const res = mockRes();
    await remove(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Reserva cancelada correctamente' });
  });

  test('500 - error del servicio', async () => {
    mockCancelReservation.mockRejectedValue(new Error('Error inesperado de BD'));
    const req = { params: { id: '9999' } };
    const res = mockRes();
    await remove(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});