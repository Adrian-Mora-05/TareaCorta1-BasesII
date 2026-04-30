import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock del caché
const mockGetCache = jest.fn();
const mockSetCache = jest.fn();
const mockDeletePattern = jest.fn();

jest.unstable_mockModule('../../src/config/cache.js', () => ({
  getCache: mockGetCache,
  setCache: mockSetCache,
  deletePattern: mockDeletePattern,
  deleteCache: jest.fn(),
  TTL: { RESTAURANTS: 300, MENUS: 180, SEARCH: 60 }
}));

// Mock del menuDAO inyectado en MenuService
const mockMenuDAO = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByRestaurant: jest.fn(),
  findAll: jest.fn()
};

const { MenuService } = await import('../../src/services/menus.service.js');

// Instancia con el DAO y caché mockeados
const menuService = new MenuService(mockMenuDAO);

describe('MenuService', () => {

  beforeEach(() => jest.clearAllMocks());

  // ── create ────────────────────────────────────────────────

  test('create - crea menú y limpia caché del restaurante', async () => {
    mockMenuDAO.create.mockResolvedValue({ id: 1, nombre: 'Menú Principal' });
    mockDeletePattern.mockResolvedValue();

    const result = await menuService.create({
      nombre: 'Menú Principal',
      id_restaurante: 1
    });

    expect(mockMenuDAO.create).toHaveBeenCalledWith({
      nombre: 'Menú Principal',
      id_restaurante: 1
    });
    // Verifica que limpió el caché del restaurante
    expect(mockDeletePattern).toHaveBeenCalledWith('menus:1:*');
    expect(result).toHaveProperty('id', 1);
  });

  test('create - lanza error si faltan campos', async () => {
    await expect(menuService.create({ nombre: 'Solo nombre' }))
      .rejects.toThrow('nombre e id_restaurante son obligatorios');

    expect(mockMenuDAO.create).not.toHaveBeenCalled();
  });

  test('create - lanza error si falta nombre', async () => {
    await expect(menuService.create({ id_restaurante: 1 }))
      .rejects.toThrow('nombre e id_restaurante son obligatorios');
  });

  // ── findById ──────────────────────────────────────────────

  test('findById - retorna desde caché si existe', async () => {
    mockGetCache.mockResolvedValue({ id: 1, nombre: 'Menú Principal' });

    const result = await menuService.findById(1);

    // No debe ir a la base de datos
    expect(mockMenuDAO.findById).not.toHaveBeenCalled();
    expect(result).toHaveProperty('nombre', 'Menú Principal');
  });

  test('findById - va a la BD y guarda en caché si no existe en Redis', async () => {
    mockGetCache.mockResolvedValue(null);
    mockMenuDAO.findById.mockResolvedValue({ id: 1, nombre: 'Menú Principal' });
    mockSetCache.mockResolvedValue();

    const result = await menuService.findById(1);

    expect(mockMenuDAO.findById).toHaveBeenCalledWith(1);
    expect(mockSetCache).toHaveBeenCalledWith(
      'menus:item:1',
      expect.any(Object),
      180
    );
    expect(result).toHaveProperty('nombre', 'Menú Principal');
  });

  test('findById - retorna null si el menú no existe', async () => {
    mockGetCache.mockResolvedValue(null);
    mockMenuDAO.findById.mockResolvedValue(null);

    const result = await menuService.findById(99999);

    // No guarda null en caché
    expect(mockSetCache).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  // ── update ────────────────────────────────────────────────

  test('update - actualiza menú y limpia caché', async () => {
    mockGetCache.mockResolvedValue(null);
    // findById retorna el menú existente
    mockMenuDAO.findById.mockResolvedValue({
      id: 1,
      nombre: 'Menú Viejo',
      id_restaurante: 1
    });
    mockMenuDAO.update.mockResolvedValue({ id: 1, nombre: 'Menú Nuevo' });
    mockDeletePattern.mockResolvedValue();

    const result = await menuService.update(1, { nombre: 'Menú Nuevo' });

    expect(mockMenuDAO.update).toHaveBeenCalledWith(1, { nombre: 'Menú Nuevo' });
    // Limpia caché individual y del restaurante
    expect(mockDeletePattern).toHaveBeenCalledWith('menus:item:1');
    expect(mockDeletePattern).toHaveBeenCalledWith('menus:1:*');
  });

  test('update - lanza error si falta nombre', async () => {
    await expect(menuService.update(1, {}))
      .rejects.toThrow('nombre es obligatorio');

    expect(mockMenuDAO.update).not.toHaveBeenCalled();
  });

  test('update - lanza error si el menú no existe', async () => {
    mockMenuDAO.findById.mockResolvedValue(null);

    await expect(menuService.update(99999, { nombre: 'Nuevo' }))
      .rejects.toThrow('Menú no encontrado');
  });

  // ── delete ────────────────────────────────────────────────

  test('delete - elimina menú y limpia caché', async () => {
    mockMenuDAO.findById.mockResolvedValue({
      id: 1,
      nombre: 'Menú Principal',
      id_restaurante: 1
    });
    mockMenuDAO.delete.mockResolvedValue(true);
    mockDeletePattern.mockResolvedValue();

    const result = await menuService.delete(1);

    expect(mockMenuDAO.delete).toHaveBeenCalledWith(1);
    // Limpia caché individual y del restaurante
    expect(mockDeletePattern).toHaveBeenCalledWith('menus:item:1');
    expect(mockDeletePattern).toHaveBeenCalledWith('menus:1:*');
    expect(result).toBe(true);
  });

  test('delete - lanza error si el menú no existe', async () => {
    mockMenuDAO.findById.mockResolvedValue(null);

    await expect(menuService.delete(99999))
      .rejects.toThrow('Menú no encontrado');

    expect(mockMenuDAO.delete).not.toHaveBeenCalled();
  });

  // ── findByRestaurant ──────────────────────────────────────

  test('findByRestaurant - retorna desde caché si existe', async () => {
    mockGetCache.mockResolvedValue([{ id: 1, nombre: 'Menú Principal' }]);

    const result = await menuService.findByRestaurant(1);

    expect(mockMenuDAO.findByRestaurant).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  test('findByRestaurant - va a la BD y guarda en caché si no existe', async () => {
    mockGetCache.mockResolvedValue(null);
    mockMenuDAO.findByRestaurant.mockResolvedValue([
      { id: 1, nombre: 'Menú Principal' }
    ]);
    mockSetCache.mockResolvedValue();

    const result = await menuService.findByRestaurant(1);

    expect(mockMenuDAO.findByRestaurant).toHaveBeenCalledWith(1);
    expect(mockSetCache).toHaveBeenCalledWith(
      'menus:1:all',
      expect.any(Array),
      180
    );
    expect(result).toHaveLength(1);
  });

  test('findByRestaurant - retorna arreglo vacío si no hay menús', async () => {
    mockGetCache.mockResolvedValue(null);
    mockMenuDAO.findByRestaurant.mockResolvedValue([]);
    mockSetCache.mockResolvedValue();

    const result = await menuService.findByRestaurant(99999);

    expect(result).toEqual([]);
  });

});