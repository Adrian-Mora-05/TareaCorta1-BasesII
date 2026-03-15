// auth.js
import 'dotenv/config';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${KEYCLOAK_URL}/realms/restaurant/protocol/openid-connect/certs`
  }),
  audience: false,
  algorithms: ['RS256']
});