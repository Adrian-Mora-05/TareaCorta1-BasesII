import { jest } from '@jest/globals';

// MOCKS DE SERVICIOS: Reemplazamos todos los servicios con versiones falsas
// para no depender de la base de datos ni de Keycloak
// en las pruebas de los controladores


// Reemplaza auth.service.js con funciones falsas controlables
jest.unstable_mockModule('../services/auth.service.js', () => ({
  registrarUsuario: jest.fn(),
  loginUser: jest.fn()
}));

// Reemplaza users.service.js con funciones falsas controlables
jest.unstable_mockModule('../services/users.service.js', () => ({
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
}));

// Reemplaza restaurants.service.js con funciones falsas controlables
jest.unstable_mockModule('../services/restaurants.service.js', () => ({
  registrarRestaurante: jest.fn(),
  listarRestaurantes: jest.fn()
}));

// Reemplaza menus.service.js con funciones falsas controlables
jest.unstable_mockModule('../services/menus.service.js', () => ({
  crearMenu: jest.fn()
}));

// IMPORTACIÓN DE CONTROLADORES: Se importan DESPUÉS de los mocks para que cuando los
// controladores carguen sus servicios, reciban los falsos


// Importa los controladores de autenticación
const { register, login } = await import('../controllers/auth.controller.js');

// Importa los controladores de usuarios
const { getMe, update, remove } = await import('../controllers/users.controller.js');

// Importa los controladores de restaurantes
// Se renombra 'crear' para evitar conflicto con el crear de menús
const { crear: crearRestaurante, listar } = await import('../controllers/restaurants.controller.js');

// Importa el controlador de menús
const { crear: crearMenu } = await import('../controllers/menus.controller.js');

// Se importan los mocks para poder configurarlos en cada prueba
// con mockResolvedValue o mockRejectedValue

const { registrarUsuario, loginUser } = await import('../services/auth.service.js');
const { getUserById, updateUser, deleteUser } = await import('../services/users.service.js');
const { registrarRestaurante, listarRestaurantes } = await import('../services/restaurants.service.js');
const { crearMenu: crearMenuService } = await import('../services/menus.service.js');

// HELPER mockReqRes: Los controladores reciben req y res de Express
// Como no tenemos un servidor real en las pruebas,
// creamos objetos falsos que imitan req y res
function mockReqRes(body = {}, params = {}, auth = {}) {
  const req = {
    // body contiene los datos enviados en el cuerpo de la petición
    body,
    // params contiene los parámetros de la URL como :id
    params,
    // auth es lo que checkJwt agrega al req después de verificar el token
    auth
  };
  const res = {
    statusCode: 200,
    // mockReturnThis hace que status() devuelva res para poder encadenar
    // por ejemplo res.status(200).json({}) funciona porque status devuelve res
    status: jest.fn().mockReturnThis(),
    // json guarda la respuesta para que podamos verificarla después
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };
  return { req, res };
}

// PRUEBAS DEL AUTH CONTROLLER
describe('auth.controller', () => {

  // Limpia el historial de llamadas antes de cada prueba
  beforeEach(() => jest.clearAllMocks());

  // Caso exitoso: todos los campos presentes y Keycloak acepta el registro
  test('register responde 201 cuando el registro es exitoso', async () => {
    // Simula que registerUser no lanza ningún error
    registrarUsuario.mockResolvedValue(true);

    const { req, res } = mockReqRes({
      username: 'usuario1',
      email: 'usuario1@test.com',
      password: 'pass123'
    });

    await register(req, res);

    // Verifica que el controlador respondió con 201 Created
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado correctamente' });
  });

  // Caso de error: faltan campos obligatorios en el body
  test('register responde 400 si faltan campos obligatorios', async () => {
    // Body vacío simula que el usuario no envió datos
    const { req, res } = mockReqRes({});

    await register(req, res);

    // El controlador debe responder con 400 Bad Request
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Caso exitoso: credenciales correctas devuelven un token
  test('login responde 200 con el token cuando las credenciales son correctas', async () => {
    // Simula que loginUser devuelve un token válido
    loginUser.mockResolvedValue({
      access_token: 'token-123',
      token_type: 'Bearer'
    });

    const { req, res } = mockReqRes({
      username: 'admin1',
      password: 'admin123'
    });

    await login(req, res);

    // Verifica que respondió con 200 y que el token está en la respuesta
    expect(res.status).toHaveBeenCalledWith(200);
    // expect.objectContaining verifica que el objeto tiene AL MENOS esas propiedades
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      access_token: 'token-123'
    }));
  });

  // Caso de error: faltan usuario o contraseña
  test('login responde 400 si faltan credenciales', async () => {
    const { req, res } = mockReqRes({});

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Caso de error: credenciales incorrectas rechazan la promesa
  test('login responde 401 si las credenciales son incorrectas', async () => {
    // mockRejectedValue simula que loginUser lanzó un error
    loginUser.mockRejectedValue(new Error('Credenciales inválidas'));

    const { req, res } = mockReqRes({
      username: 'malo',
      password: 'mala'
    });

    await login(req, res);

    // El controlador debe responder con 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
  });

});


// PRUEBAS DEL USERS CONTROLLER
describe('users.controller', () => {

  beforeEach(() => jest.clearAllMocks());

  // Caso exitoso: el usuario existe en la base de datos
  test('getMe responde 200 con los datos del usuario', async () => {
    // Simula que la base de datos encontró al usuario
    getUserById.mockResolvedValue({
      id: 1,
      nombre: 'Admin',
      correo: 'admin@test.com',
      rol: 'admin'
    });

    // auth.sub es el UUID de Keycloak que viene en el token JWT
    const { req, res } = mockReqRes({}, {}, { sub: 'uuid-123' });

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Caso de error: el usuario no está en la base de datos
  test('getMe responde 404 si el usuario no existe', async () => {
    // undefined simula que la consulta no encontró ninguna fila
    getUserById.mockResolvedValue(undefined);

    const { req, res } = mockReqRes({}, {}, { sub: 'uuid-inexistente' });

    await getMe(req, res);

    // El controlador debe responder con 404 Not Found
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // Caso exitoso: actualización con todos los campos presentes
  test('update responde 200 cuando la actualización es exitosa', async () => {
    updateUser.mockResolvedValue({ message: 'Usuario actualizado correctamente' });

    // params tiene el id que viene de la URL /users/1
    const { req, res } = mockReqRes(
      { nombre: 'Nuevo Nombre', correo: 'nuevo@test.com' },
      { id: '1' }
    );

    await update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Caso de error: faltan nombre o correo en el body
  test('update responde 400 si faltan campos', async () => {
    const { req, res } = mockReqRes({}, { id: '1' });

    await update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Caso exitoso: eliminación de usuario
  test('remove responde 200 cuando la eliminación es exitosa', async () => {
    deleteUser.mockResolvedValue({ message: 'Usuario eliminado correctamente' });

    const { req, res } = mockReqRes({}, { id: '1' });

    await remove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

});

// PRUEBAS DEL RESTAURANTS CONTROLLER
describe('restaurants.controller', () => {

  beforeEach(() => jest.clearAllMocks());

  // Caso exitoso: restaurante creado con todos los campos
  test('crear responde 201 cuando el restaurante se registra correctamente', async () => {
    registrarRestaurante.mockResolvedValue({ id: 1 });

    const { req, res } = mockReqRes({
      nombre: 'La Trattoria',
      direccion: 'Cartago',
      telefono: '2550-1234'
    });

    await crearRestaurante(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  // Caso de error: falta el nombre que es obligatorio
  test('crear responde 400 si falta el nombre', async () => {
    const { req, res } = mockReqRes({});

    await crearRestaurante(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Caso exitoso: lista todos los restaurantes
  test('listar responde 200 con la lista de restaurantes', async () => {
    listarRestaurantes.mockResolvedValue([
      { id: 1, nombre: 'La Trattoria' }
    ]);

    const { req, res } = mockReqRes();

    await listar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

});


// PRUEBAS DEL MENUS CONTROLLER
describe('menus.controller', () => {

  beforeEach(() => jest.clearAllMocks());

  // Caso exitoso: menú creado con todos los campos
  test('crear responde 201 cuando el menú se crea correctamente', async () => {
    crearMenuService.mockResolvedValue({ id: 1 });

    const { req, res } = mockReqRes({
      nombre: 'Menú Principal',
      id_restaurante: 1
    });

    await crearMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  // Caso de error: faltan nombre o id_restaurante
  test('crear responde 400 si faltan campos', async () => {
    const { req, res } = mockReqRes({});

    await crearMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});