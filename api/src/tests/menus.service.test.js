import { jest } from '@jest/globals';

// Función falsa que reemplaza query de db.js
const mockQuery = jest.fn();

// Reemplaza el módulo db.js por el mock antes de importar el servicio
jest.unstable_mockModule('../config/db.js', () => ({
  query: mockQuery
}));

// Importa el servicio DESPUÉS del mock
const { crearMenu } = await import('../services/menus.service.js');

describe('menus.service', () => {

  // Limpia el mock antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Prueba que crearMenu devuelve el ID del menú recién creado
  test('crearMenu retorna el id del menú creado', async () => {

    // Simula que PostgreSQL ejecutó la función crear_menu y devolvió el ID 1
    mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

    const result = await crearMenu('Menú Principal', 1);

    // Verifica que el resultado contiene el ID correcto
    expect(result).toHaveProperty('id', 1);
  });

  // Prueba que crearMenu llama a la base de datos con los parámetros correctos
  test('crearMenu llama a query con los parámetros correctos', async () => {

    mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

    await crearMenu('Menú Verano', 2);

    // toHaveBeenCalledWith verifica que mockQuery fue llamado
    // con exactamente ese SQL y esos parámetros
    // Esto confirma que el servicio construye la consulta correctamente
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT restaurant.crear_menu($1, $2) AS id',
      ['Menú Verano', 2]
    );
  });

});