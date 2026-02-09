import { z } from 'zod';
import {
  loginSchema,
  refreshSchema,
  logoutSchema,
  authResponseSchema,
  tokenResponseSchema,
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

// Auth types
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

// Health types
export type HealthResponse = z.infer<typeof healthResponseSchema>;

// Error types
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Pagination types
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type PaginationResponse = z.infer<typeof paginationResponseSchema>;

// User types
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

// Wine types
export type Wine = z.infer<typeof wineSchema>;
export type CreateWineInput = z.infer<typeof createWineSchema>;
export type UpdateWineInput = z.infer<typeof updateWineSchema>;

// Bottle types
export type Bottle = z.infer<typeof bottleSchema>;
export type CreateBottleInput = z.infer<typeof createBottleSchema>;
export type UpdateBottleInput = z.infer<typeof updateBottleSchema>;

// Tasting Note types
export type TastingNote = z.infer<typeof tastingNoteSchema>;
export type CreateTastingNoteInput = z.infer<typeof createTastingNoteSchema>;
export type UpdateTastingNoteInput = z.infer<typeof updateTastingNoteSchema>;

// Storage Location types
export type StorageLocation = z.infer<typeof storageLocationSchema>;
export type CreateStorageLocationInput = z.infer<typeof createStorageLocationSchema>;
export type UpdateStorageLocationInput = z.infer<typeof updateStorageLocationSchema>;

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResponse;
}
