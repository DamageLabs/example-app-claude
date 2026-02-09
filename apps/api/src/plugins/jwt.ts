import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';

export default fp(async function jwtPlugin(server: FastifyInstance) {
  const jwtSecret = process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret-change-me';

  // Access token namespace (short-lived)
  await server.register(jwt, {
    secret: jwtSecret,
    sign: {
      expiresIn: process.env.JWT_EXPIRY || '15m',
      algorithm: 'HS256',
    },
    namespace: 'access',
  });

  // Refresh token namespace (long-lived)
  await server.register(jwt, {
    secret: jwtRefreshSecret,
    sign: {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      algorithm: 'HS256',
    },
    namespace: 'refresh',
  });
});
