import 'dotenv/config';

// URL base de Keycloak leída desde las variables de entorno
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
// Nombre del reino en Keycloak
const REALM = 'restaurant';
// ID del cliente OAuth registrado en Keycloak
const CLIENT_ID = 'api-restaurant';
// Secreto del cliente OAuth
const CLIENT_SECRET = 'api-restaurant-secret';

// Función para registrar un nuevo usuario en Keycloak
export async function registrarUsuario(userData) {
  // Primero necesitamos un token de administrador para poder crear usuarios
  const tokenRes = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    {
      method: 'POST',
      // Los datos se envían como formulario, no como JSON
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      })
    }
  );

  // Extrae el token de la respuesta
  const tokenData = await tokenRes.json();
  const adminToken = tokenData.access_token;

  // Con el token de admin, crea el usuario en Keycloak
  const createRes = await fetch(
    `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // El token de admin va en el header Authorization
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: true,
        // Configura la contraseña del usuario nuevo
        credentials: [{
          type: 'password',
          value: userData.password,
          temporary: false
        }],
        // Asigna el rol por defecto 'cliente' al registrarse
        realmRoles: ['cliente']
      })
    }
  );

  // Si Keycloak responde con error, lanza una excepción
  if (!createRes.ok) {
    const error = await createRes.json();
    throw new Error(JSON.stringify(error) || 'Error al registrar usuario');
  }

  // Retorna true si el usuario fue creado exitosamente
  return true;
}

// Función para hacer login y obtener un token JWT
export async function loginUser(username, password) {
  // Hace la petición de login directamente a Keycloak
  const res = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username,
        password
      })
    }
  );

  // Si las credenciales son incorrectas Keycloak responde con error
  if (!res.ok) {
    throw new Error('Credenciales inválidas');
  }

  // Retorna el objeto completo con access_token, refresh_token, etc.
  return await res.json();
}