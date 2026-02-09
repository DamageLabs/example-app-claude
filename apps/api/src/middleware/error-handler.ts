import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const response: ErrorResponseBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  // Zod validation errors
  if (error.cause instanceof ZodError) {
    response.error.code = 'VALIDATION_ERROR';
    response.error.message = 'Validation failed';
    response.error.details = error.cause.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return reply.status(400).send(response);
  }

  // Fastify validation errors (from schema validation)
  if (error.validation) {
    response.error.code = 'VALIDATION_ERROR';
    response.error.message = 'Validation failed';
    response.error.details = error.validation.map((v) => ({
      field: String(v.instancePath || v.params?.missingProperty || 'unknown'),
      message: v.message || 'Invalid value',
    }));
    return reply.status(400).send(response);
  }

  // HTTP errors with status codes
  if (error.statusCode) {
    response.error.code = error.code || 'HTTP_ERROR';
    response.error.message = error.message;
    return reply.status(error.statusCode).send(response);
  }

  // Unknown errors - sanitize in production
  if (process.env.NODE_ENV === 'production') {
    response.error.message = 'An unexpected error occurred';
  } else {
    response.error.message = error.message;
  }

  reply.log.error(error);
  return reply.status(500).send(response);
}
