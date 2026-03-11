require('dotenv').config();

const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// Definir KEYCLOAK_URL a partir de las variables de entorno
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;

// Middleware para validar JWT de Keycloak
const checkJwt = jwt({
  // Obtiene la clave pública de Keycloak automáticamente
  secret: jwksRsa.expressJwtSecret({
    cache: true,            // cachea las claves
    rateLimit: true,        // limita requests a Keycloak
    jwksRequestsPerMinute: 5,
    jwksUri: `${KEYCLOAK_URL}/realms/restaurant/protocol/openid-connect/certs`
  }),

  // Validamos el token para este audience (cliente)
  audience: 'api-restaurant',
  issuer: `${KEYCLOAK_URL}/realms/restaurant`,
  algorithms: ['RS256']
});

module.exports = { checkJwt };