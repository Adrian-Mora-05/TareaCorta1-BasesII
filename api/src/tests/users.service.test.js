// Importa jest para usar sus utilidades de mock
import { jest } from '@jest/globals';

// Crea una función falsa que reemplazará a query de db.js
// jest.fn() crea una función vacía que Jest puede rastrear y controlar
const mockQuery = jest.fn();

// Cuando users.service.js haga import de db.js, recibirá este objeto falso
// en lugar del pool real de PostgreSQL
jest.unstable_mockModule('../config/db.js', () => ({
  query: mockQuery
}));

// Los imports de los servicios deben ir DESPUÉS del mock
// porque necesitamos que cuando se cargue el servicio,
// ya encuentre el mock de db.js en lugar del real
const { getUserById, updateUser, deleteUser } = await import('../services/users.service.js');

// Agrupa todas las pruebas del servicio de usuarios
describe('users.service', () => {

  // Limpia el mock antes de cada prueba para evitar interferencias
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Prueba que getUserById devuelve el usuario cuando existe en la base de datos
  test('getUserById devuelve el usuario cuando existe', async () => {

    // Simula que la base de datos encontró un usuario y lo devolvió
    // rows es el arreglo de resultados que devuelve PostgreSQL
    mockQuery.mockResolvedValue({
      rows: [{
        id: 1,
        nombre: 'Admin Principal',
        correo: 'admin1@restaurant.com',
        rol: 'admin'
      }]
    });

    // Llama a la función con el UUID de Keycloak
    const result = await getUserById('027297be-b3c3-4822-a934-5c453794b39a');

    // Verifica cada propiedad del usuario devuelto
    // toHaveProperty(propiedad, valor) comprueba la propiedad y su valor
    expect(result).toHaveProperty('nombre', 'Admin Principal');
    expect(result).toHaveProperty('correo', 'admin1@restaurant.com');
    expect(result).toHaveProperty('rol', 'admin');
  });

  // Prueba que getUserById devuelve undefined cuando el usuario no existe
  test('getUserById devuelve undefined cuando el usuario no existe', async () => {

    // Simula que la base de datos no encontró ningún usuario
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await getUserById('uuid-que-no-existe');

    
    // toBeUndefined verifica que el valor es exactamente undefined
    expect(result).toBeUndefined();
  });

  // Prueba que updateUser devuelve el mensaje de confirmación correcto
  test('updateUser retorna mensaje de confirmación', async () => {

    // El UPDATE no devuelve filas, solo ejecuta la acción
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await updateUser(1, 'Nuevo Nombre', 'nuevo@correo.com');

    // toEqual compara el contenido completo del objeto
    // Es diferente a toBe que compara la referencia en memoria
    expect(result).toEqual({ message: 'Usuario actualizado correctamente' });
  });

  // Prueba que deleteUser devuelve el mensaje de confirmación correcto
  test('deleteUser retorna mensaje de confirmación', async () => {

    // El DELETE tampoco devuelve filas
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await deleteUser(1);

    expect(result).toEqual({ message: 'Usuario eliminado correctamente' });
  });

});