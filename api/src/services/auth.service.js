import 'dotenv/config';
import { query } from '../config/postgresdb.js';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
const REALM = process.env.REALM || 'restaurant';
const KEYCLOAK_ADMIN = process.env.KEYCLOAK_ADMIN;
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD;
const LOGIN_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const LOGIN_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;
const KEYCLOAK_ADMIN_CLIENT_ID = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli';


// Token admin: siempre contra realm/master con admin-cli (sin secret)
async function getAdminToken(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const tokenRes = await fetch(
        `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, // 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',         
            username: KEYCLOAK_ADMIN,
            password: KEYCLOAK_ADMIN_PASSWORD
          })
        }
      );

      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        console.error('KEYCLOAK ADMIN ERROR:', JSON.stringify(err));
        throw new Error(`Keycloak responded ${tokenRes.status}`);
      }

      const tokenData = await tokenRes.json();
      return tokenData.access_token;

    } catch (err) {
      console.log(`Keycloak not ready yet (${i+1}/${retries})... retrying in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Could not connect to Keycloak after multiple retries');
}

export async function registrarUsuario(userData) {
  const adminToken = await getAdminToken();
  const rol = userData.role || 'cliente';

  // 1. Crear usuario en Keycloak
  const createRes = await fetch(
    `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: true,
        emailVerified: true,
        credentials: [{ type: 'password', value: userData.password, temporary: false }]
      })
    }
  );

  if (!createRes.ok) {
    const error = await createRes.json();
    throw new Error(error.errorMessage || 'Error al registrar usuario en Keycloak');
  }

  // 2. Obtener ID del usuario creado
  const getUserRes = await fetch(
    `${KEYCLOAK_URL}/admin/realms/${REALM}/users?username=${userData.username}`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const users = await getUserRes.json();
  const keycloakId = users[0]?.id;

  if (!keycloakId) throw new Error('No se pudo obtener el ID del usuario creado');

  // 3. Obtener datos del rol desde Keycloak
  const getRolRes = await fetch(
    `${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${rol}`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );

  if (!getRolRes.ok) throw new Error(`Rol '${rol}' no encontrado en Keycloak`);
  const rolData = await getRolRes.json();

  // 4. Asignar rol al usuario
  await fetch(
    `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${keycloakId}/role-mappings/realm`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify([{ id: rolData.id, name: rolData.name }])
    }
  );

  // 5. Guardar en PostgreSQL
  const rolResult = await query(
    `SELECT id FROM restaurant.rol_usuario WHERE nombre = $1`,
    [rol]
  );
  const id_rol = rolResult.rows[0]?.id;

  if (!id_rol) throw new Error(`Rol '${rol}' no encontrado en base de datos`);

  await query(
    `INSERT INTO restaurant.usuario (id_external_auth, nombre, correo, id_rol_usuario)
     VALUES ($1, $2, $3, $4)`,
    [keycloakId, `${userData.firstName} ${userData.lastName}`, userData.email, id_rol]
  );

  return true;
}

export async function loginUser(username, password) {
  const res = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: LOGIN_CLIENT_ID,       // api-restaurant
        client_secret: LOGIN_CLIENT_SECRET, // api-restaurant-secret
        username,
        password
      })
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('KEYCLOAK LOGIN ERROR:', text);
    throw new Error('Credenciales inválidas');
  }

  return await res.json();
}