import type { z } from 'zod';
import type {
  loginSchema,
  refreshSchema,
  logoutSchema,
  tokenResponseSchema,
  authResponseSchema,
  healthResponseSchema,
  errorResponseSchema,
  paginationQuerySchema,
  paginationResponseSchema,
  userSchema,
  createUserSchema,
  wineSchema,
  createWineSchema,
  updateWineSchema,
  bottleSchema,
  createBottleSchema,
  updateBottleSchema,
  tastingNoteSchema,
  createTastingNoteSchema,
  updateTastingNoteSchema,
  storageLocationSchema,
  createStorageLocationSchema,
  updateStorageLocationSchema,
} from '../schemas/index.js';

// ── Auth ────────────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

// ── Health ───────────────────────────────────────────────────────────────────────

export type HealthResponse = z.infer<typeof healthResponseSchema>;

// ── Error ────────────────────────────────────────────────────────────────────────

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ── Pagination ───────────────────────────────────────────────────────────────────

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type PaginationResponse = z.infer<typeof paginationResponseSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResponse;
}

// ── User ─────────────────────────────────────────────────────────────────────────

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

// ── Wine ─────────────────────────────────────────────────────────────────────────

export type Wine = z.infer<typeof wineSchema>;
export type CreateWineInput = z.infer<typeof createWineSchema>;
export type UpdateWineInput = z.infer<typeof updateWineSchema>;

// ── Bottle ───────────────────────────────────────────────────────────────────────

export type Bottle = z.infer<typeof bottleSchema>;
export type CreateBottleInput = z.infer<typeof createBottleSchema>;
export type UpdateBottleInput = z.infer<typeof updateBottleSchema>;

// ── Tasting Note ─────────────────────────────────────────────────────────────────

export type TastingNote = z.infer<typeof tastingNoteSchema>;
export type CreateTastingNoteInput = z.infer<typeof createTastingNoteSchema>;
export type UpdateTastingNoteInput = z.infer<typeof updateTastingNoteSchema>;

// ── Storage Location ─────────────────────────────────────────────────────────────

export type StorageLocation = z.infer<typeof storageLocationSchema>;
export type CreateStorageLocationInput = z.infer<typeof createStorageLocationSchema>;
export type UpdateStorageLocationInput = z.infer<typeof updateStorageLocationSchema>;
