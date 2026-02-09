import Fastify from 'fastify';
import cors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import jwtPlugin from './plugins/jwt.js';

export async function buildServer(opts?: { logger?: boolean }) {
  const server = Fastify({
    logger: opts?.logger !== undefined
      ? opts.logger
      : {
          transport:
            process.env.NODE_ENV !== 'production'
              ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' } }
              : undefined,
        },
  });

  // Zod type provider
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  });

  // Error handler
  server.setErrorHandler(errorHandler);

  // JWT authentication
  await server.register(jwtPlugin);

  // Routes
  await server.register(healthRoutes);
  await server.register(authRoutes);

  return server;
}
