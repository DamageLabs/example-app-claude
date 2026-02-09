import { z } from 'zod';
import { WINE_COLORS, BOTTLE_SIZES, BOTTLE_STATUSES, USER_ROLES } from '../constants/index.js';

// --- Auth schemas ---

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    displayName: z.string(),
    role: z.enum(USER_ROLES),
  }),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// --- Health schemas ---

export const healthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  version: z.string(),
});

// --- Error schemas ---

export const errorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(errorDetailSchema).optional(),
  }),
});

// --- Pagination schemas ---

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const paginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// --- User schemas ---

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  displayName: z.string(),
  role: z.enum(USER_ROLES),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  displayName: z.string().min(1, 'Display name is required').max(255),
  role: z.enum(USER_ROLES).default('member'),
});

// --- Wine schemas ---

export const wineSchema = z.object({
  id: z.number(),
  name: z.string(),
  producer: z.string(),
  region: z.string(),
  subRegion: z.string().nullable(),
  country: z.string(),
  vintage: z.number().nullable(),
  varietal: z.string(),
  color: z.enum(WINE_COLORS),
  bottleSize: z.enum(BOTTLE_SIZES),
  alcoholPct: z.number().nullable(),
  drinkFrom: z.number().nullable(),
  drinkTo: z.number().nullable(),
  notes: z.string().nullable(),
  createdBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createWineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  producer: z.string().min(1, 'Producer is required').max(255),
  region: z.string().min(1, 'Region is required').max(255),
  subRegion: z.string().max(255).nullable().optional(),
  country: z.string().min(1, 'Country is required').max(255),
  vintage: z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  varietal: z.string().min(1, 'Varietal is required').max(255),
  color: z.enum(WINE_COLORS),
  bottleSize: z.enum(BOTTLE_SIZES).default('750ml'),
  alcoholPct: z.number().min(0).max(100).nullable().optional(),
  drinkFrom: z.number().int().nullable().optional(),
  drinkTo: z.number().int().nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
});

export const updateWineSchema = createWineSchema.partial();

// --- Bottle schemas ---

export const bottleSchema = z.object({
  id: z.number(),
  wineId: z.number(),
  storageLocation: z.string().nullable(),
  purchaseDate: z.string().nullable(),
  purchasePrice: z.number().nullable(),
  purchaseCurrency: z.string(),
  purchaseSource: z.string().nullable(),
  status: z.enum(BOTTLE_STATUSES),
  consumedDate: z.string().nullable(),
  addedBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createBottleSchema = z.object({
  storageLocation: z.string().max(255).nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  purchasePrice: z.number().min(0).nullable().optional(),
  purchaseCurrency: z.string().max(10).default('USD'),
  purchaseSource: z.string().max(255).nullable().optional(),
  status: z.enum(BOTTLE_STATUSES).default('in_stock'),
  quantity: z.number().int().positive().max(100).default(1),
});

export const updateBottleSchema = z.object({
  storageLocation: z.string().max(255).nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  purchasePrice: z.number().min(0).nullable().optional(),
  purchaseCurrency: z.string().max(10).optional(),
  purchaseSource: z.string().max(255).nullable().optional(),
  status: z.enum(BOTTLE_STATUSES).optional(),
  consumedDate: z.string().nullable().optional(),
});

// --- Tasting Note schemas ---

export const tastingNoteSchema = z.object({
  id: z.number(),
  bottleId: z.number(),
  userId: z.number(),
  tastedDate: z.string(),
  rating: z.number().nullable(),
  appearance: z.string().nullable(),
  nose: z.string().nullable(),
  palate: z.string().nullable(),
  finish: z.string().nullable(),
  overallNotes: z.string().nullable(),
  occasion: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTastingNoteSchema = z.object({
  tastedDate: z.string().min(1, 'Tasted date is required'),
  rating: z.number().int().min(1).max(100).nullable().optional(),
  appearance: z.string().max(2000).nullable().optional(),
  nose: z.string().max(2000).nullable().optional(),
  palate: z.string().max(2000).nullable().optional(),
  finish: z.string().max(2000).nullable().optional(),
  overallNotes: z.string().max(10000).nullable().optional(),
  occasion: z.string().max(255).nullable().optional(),
});

export const updateTastingNoteSchema = createTastingNoteSchema.partial();

// --- Storage Location schemas ---

export const storageLocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable(),
  description: z.string().nullable(),
  capacity: z.number().nullable(),
  createdAt: z.string(),
});

export const createStorageLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  parentId: z.number().int().positive().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
});

export const updateStorageLocationSchema = createStorageLocationSchema.partial();
