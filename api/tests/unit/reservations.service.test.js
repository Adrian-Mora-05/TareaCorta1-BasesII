import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock del reservationDAO
const mockReservationDAO = {
  create: jest.fn(),
  findById: jest.fn(),
  cancel: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

// Mock del userDAO inyectado también en ReservationService
const mockUserDAO = {
  findByExternalId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const { ReservationService } = await import('../../src/services/reservations.service.js');

// Instancia con ambos DAOs mockeados
const reservationService = new ReservationService(mockReservationDAO, mockUserDAO);

describe('ReservationService', () => {

  beforeEach(() => jest.clearAllMocks());

  test('create - crea reserva correctamente', async () => {
    // Usuario encontrado por su keycloakId
    mockUserDAO.findByExternalId.mockResolvedValue({ id: 1 });
    mockReservationDAO.create.mockResolvedValue({ id: 42 });

    const result = await reservationService.create({
      keycloakId: 'uuid-123',
      id_restaurante: 1,
      id_mesa: 1,
      fecha: '2027-01-01',
      duracion: 90,
      personas: 4
    });

    expect(result).toHaveProperty('id', 42);
    // Verifica que create fue llamado con el id del usuario resuelto
    expect(mockReservationDAO.create).toHaveBeenCalledWith({
      id_usuario: 1,
      id_restaurante: 1,
      id_mesa: 1,
      fecha: '2027-01-01',
      duracion: 90,
      personas: 4
    });
  });

  test('create - lanza error si usuario no existe', async () => {
    mockUserDAO.findByExternalId.mockResolvedValue(null);

    await expect(reservationService.create({
      keycloakId: 'uuid-xxx',
      id_restaurante: 1,
      id_mesa: 1,
      fecha: '2027-01-01',
      duracion: 90,
      personas: 4
    })).rejects.toThrow('Usuario no encontrado en base de datos');
  });

  test('cancel - cancela correctamente', async () => {
    // Reserva existe
    mockReservationDAO.findById.mockResolvedValue({ id: 1, estado: 'reservada' });
    mockReservationDAO.cancel.mockResolvedValue(true);

    const result = await reservationService.cancel(1);
    expect(result).toBe(true);
  });

  test('cancel - lanza error si reserva no existe', async () => {
    mockReservationDAO.findById.mockResolvedValue(null);

    await expect(reservationService.cancel(99999))
      .rejects.toThrow('Reserva no encontrada');
  });

});