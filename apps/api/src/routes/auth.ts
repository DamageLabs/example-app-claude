import type { FastifyInstance } from 'fastify';
import type { JWT } from '@fastify/jwt';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { loginSchema, refreshSchema, logoutSchema } from '@cellarsync/shared';
import { getDb, schema } from '../db/index.js';
import {
  verifyPassword,
  storeRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../services/auth.service.js';

function getJwtNamespace(server: FastifyInstance, ns: string): JWT {
  return (server.jwt as unknown as Record<string, JWT>)[ns]!;
}

export async function authRoutes(server: FastifyInstance) {
  const accessJwt = getJwtNamespace(server, 'access');
  const refreshJwt = getJwtNamespace(server, 'refresh');

  // POST /api/auth/login
  server.post('/api/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      });
    }

    const { email, password } = parsed.data;
    const db = getDb();

    // Find user by email
    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .get();

    if (!user) {
      return reply.status(401).send({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Generate tokens
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = accessJwt.sign(payload);
    const refreshToken = refreshJwt.sign({ ...payload, jti: crypto.randomUUID() });

    // Store refresh token
    const familyId = crypto.randomUUID();
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    await storeRefreshToken(db, user.id, refreshToken, familyId, refreshExpiry);

    return reply.status(200).send({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  });

  // POST /api/auth/refresh
  server.post('/api/auth/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      });
    }

    const { refreshToken: oldToken } = parsed.data;

    // Verify the old refresh token's signature
    let decoded: { id: number; email: string; role: 'admin' | 'member' };
    try {
      decoded = refreshJwt.verify<{ id: number; email: string; role: 'admin' | 'member' }>(oldToken);
    } catch {
      return reply.status(401).send({
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }

    const db = getDb();

    // Generate new tokens
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const newAccessToken = accessJwt.sign(payload);
    const newRefreshToken = refreshJwt.sign({ ...payload, jti: crypto.randomUUID() });

    // Rotate refresh token
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    const result = await rotateRefreshToken(
      db,
      oldToken,
      newRefreshToken,
      decoded.id,
      refreshExpiry,
    );

    if (!result.valid) {
      return reply.status(401).send({
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }

    return reply.status(200).send({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  // POST /api/auth/logout
  server.post('/api/auth/logout', async (request, reply) => {
    const parsed = logoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      });
    }

    const { refreshToken } = parsed.data;
    const db = getDb();

    await revokeRefreshToken(db, refreshToken);

    return reply.status(204).send();
  });
}
