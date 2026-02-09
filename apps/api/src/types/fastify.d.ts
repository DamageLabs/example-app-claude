import type { VerifyPayloadType, FastifyJwtVerifyOptions } from '@fastify/jwt';
import type { VerifierCallback } from 'fast-jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: number;
      email: string;
      role: 'admin' | 'member';
      jti?: string;
    };
    user: {
      id: number;
      email: string;
      role: 'admin' | 'member';
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    accessJwtVerify<_Decoded extends VerifyPayloadType>(options?: FastifyJwtVerifyOptions): Promise<_Decoded>;
    accessJwtVerify<_Decoded extends VerifyPayloadType>(callback: VerifierCallback): void;
    refreshJwtVerify<_Decoded extends VerifyPayloadType>(options?: FastifyJwtVerifyOptions): Promise<_Decoded>;
    refreshJwtVerify<_Decoded extends VerifyPayloadType>(callback: VerifierCallback): void;
  }
}
