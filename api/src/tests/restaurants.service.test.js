import { jest } from '@jest/globals';

// Función falsa que reemplaza query de db.js
const mockQuery = jest.fn();

// Reemplaza el módulo db.js completo por el mock
// Cualquier archivo que importe db.js recibirá este objeto falso
jest.unstable_mockModule('../config/db.js', () => ({
  query: mockQuery
}));

// Importa el servicio DESPUÉS del mock para que use la base de datos falsa
const { registrarRestaurante, listarRestaurantes } = await import('../services/restaurants.service.js');

describe('restaurants.service', () => {

  // Limpia el mock antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Prueba que registrarRestaurante devuelve el ID generado por la base de datos
  test('registrarRestaurante retorna el id del restaurante creado', async () => {

    // Simula que PostgreSQL ejecutó el INSERT y devolvió el ID 1
    mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

    const result = await registrarRestaurante('La Trattoria', 'Cartago', '2550-1234');

    // Verifica que el resultado contiene el ID correcto
    expect(result).toHaveProperty('id', 1);
  });

  // Prueba que listarRestaurantes devuelve todos los restaurantes correctamente
  test('listarRestaurantes retorna lista de restaurantes', async () => {

    // Simula que PostgreSQL devolvió dos restaurantes
    mockQuery.mockResolvedValue({
      rows: [
        { id: 1, nombre: 'La Trattoria', direccion: 'Cartago', telefono: '2550-1234' },
        { id: 2, nombre: 'El Fogón', direccion: 'San José', telefono: '2222-5678' }
      ]
    });

    const result = await listarRestaurantes();

    // Array.isArray verifica que el resultado sea un arreglo y no otro tipo de dato
    expect(Array.isArray(result)).toBe(true);
    // toHaveLength verifica que el arreglo tiene exactamente 2 elementos
    expect(result).toHaveLength(2);
    // Verifica que el primer elemento tiene el nombre correcto
    expect(result[0]).toHaveProperty('nombre', 'La Trattoria');
  });

  // Prueba el caso donde no hay restaurantes registrados
  test('listarRestaurantes retorna arreglo vacío si no hay restaurantes', async () => {

    // Simula que PostgreSQL devolvió cero filas
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await listarRestaurantes();

    // toEqual([]) verifica que el arreglo está completamente vacío
    expect(result).toEqual([]);
  });

});