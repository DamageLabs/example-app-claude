import { z } from 'zod';
import { WINE_COLORS, BOTTLE_SIZES, BOTTLE_STATUSES, USER_ROLES } from '../constants/index.js';

// ── Auth ────────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const logoutSchema = z.object({
  refreshToken: z.string(),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(USER_ROLES),
  }),
  tokens: tokenResponseSchema,
});

// ── Health ───────────────────────────────────────────────────────────────────────

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
});

// ── Error ────────────────────────────────────────────────────────────────────────

export const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});

// ── Pagination ───────────────────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const paginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// ── User ─────────────────────────────────────────────────────────────────────────

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(USER_ROLES),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(USER_ROLES).default('member'),
});

// ── Wine ─────────────────────────────────────────────────────────────────────────

export const wineSchema = z.object({
  id: z.string(),
  name: z.string(),
  producer: z.string(),
  vintage: z.number().int().nullable(),
  color: z.enum(WINE_COLORS),
  region: z.string().nullable(),
  country: z.string().nullable(),
  appellation: z.string().nullable(),
  varietal: z.string().nullable(),
  abv: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createWineSchema = z.object({
  name: z.string().min(1),
  producer: z.string().min(1),
  vintage: z.number().int().nullable().optional(),
  color: z.enum(WINE_COLORS),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  appellation: z.string().nullable().optional(),
  varietal: z.string().nullable().optional(),
  abv: z.number().min(0).max(100).nullable().optional(),
});

export const updateWineSchema = createWineSchema.partial();

// ── Bottle ───────────────────────────────────────────────────────────────────────

export const bottleSchema = z.object({
  id: z.string(),
  wineId: z.string(),
  locationId: z.string().nullable(),
  status: z.enum(BOTTLE_STATUSES),
  size: z.enum(BOTTLE_SIZES),
  acquisitionDate: z.string().nullable(),
  acquisitionPrice: z.number().nullable(),
  drinkByDate: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createBottleSchema = z.object({
  wineId: z.string(),
  locationId: z.string().nullable().optional(),
  status: z.enum(BOTTLE_STATUSES).default('in_stock'),
  size: z.enum(BOTTLE_SIZES).default('standard'),
  acquisitionDate: z.string().nullable().optional(),
  acquisitionPrice: z.number().min(0).nullable().optional(),
  drinkByDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateBottleSchema = createBottleSchema.partial();

// ── Tasting Note ─────────────────────────────────────────────────────────────────

export const tastingNoteSchema = z.object({
  id: z.string(),
  wineId: z.string(),
  userId: z.string(),
  rating: z.number().int().min(1).max(100),
  nose: z.string().nullable(),
  palate: z.string().nullable(),
  finish: z.string().nullable(),
  notes: z.string().nullable(),
  tastingDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTastingNoteSchema = z.object({
  wineId: z.string(),
  rating: z.number().int().min(1).max(100),
  nose: z.string().nullable().optional(),
  palate: z.string().nullable().optional(),
  finish: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tastingDate: z.string().optional(),
});

export const updateTastingNoteSchema = createTastingNoteSchema.partial();

// ── Storage Location ─────────────────────────────────────────────────────────────

export const storageLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createStorageLocationSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export const updateStorageLocationSchema = createStorageLocationSchema.partial();
