import type { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.accessJwtVerify();
  } catch {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      },
    });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.accessJwtVerify();
  } catch {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      },
    });
  }

  if (request.user.role !== 'admin') {
    return reply.status(403).send({
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
    });
  }
}
