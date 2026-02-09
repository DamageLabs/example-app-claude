import { sqliteTable, text, integer, real, index, uniqueIndex, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const wines = sqliteTable(
  'wines',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    producer: text('producer').notNull(),
    region: text('region').notNull(),
    subRegion: text('sub_region'),
    country: text('country').notNull(),
    vintage: integer('vintage'),
    varietal: text('varietal').notNull(),
    color: text('color', {
      enum: ['red', 'white', 'rosé', 'sparkling', 'dessert', 'fortified', 'orange'],
    }).notNull(),
    bottleSize: text('bottle_size').notNull().default('750ml'),
    alcoholPct: real('alcohol_pct'),
    drinkFrom: integer('drink_from'),
    drinkTo: integer('drink_to'),
    notes: text('notes'),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_wines_producer').on(table.producer),
    index('idx_wines_region').on(table.region),
    index('idx_wines_country').on(table.country),
    index('idx_wines_vintage').on(table.vintage),
    index('idx_wines_color').on(table.color),
  ],
);

export const bottles = sqliteTable(
  'bottles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    wineId: integer('wine_id')
      .notNull()
      .references(() => wines.id),
    storageLocation: text('storage_location'),
    purchaseDate: text('purchase_date'),
    purchasePrice: real('purchase_price'),
    purchaseCurrency: text('purchase_currency').default('USD'),
    purchaseSource: text('purchase_source'),
    status: text('status', {
      enum: ['in_stock', 'consumed', 'gifted', 'sold', 'spoiled'],
    })
      .notNull()
      .default('in_stock'),
    consumedDate: text('consumed_date'),
    addedBy: integer('added_by')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_bottles_wine_id').on(table.wineId),
    index('idx_bottles_status').on(table.status),
    index('idx_bottles_storage').on(table.storageLocation),
  ],
);

export const tastingNotes = sqliteTable(
  'tasting_notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bottleId: integer('bottle_id')
      .notNull()
      .references(() => bottles.id),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    tastedDate: text('tasted_date').notNull(),
    rating: integer('rating'),
    appearance: text('appearance'),
    nose: text('nose'),
    palate: text('palate'),
    finish: text('finish'),
    overallNotes: text('overall_notes'),
    occasion: text('occasion'),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_tasting_notes_bottle').on(table.bottleId),
    index('idx_tasting_notes_user').on(table.userId),
    index('idx_tasting_notes_rating').on(table.rating),
  ],
);

export const storageLocations = sqliteTable('storage_locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  parentId: integer('parent_id').references((): AnySQLiteColumn => storageLocations.id),
  description: text('description'),
  capacity: integer('capacity'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const refreshTokens = sqliteTable(
  'refresh_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    tokenHash: text('token_hash').notNull(),
    familyId: text('family_id').notNull(),
    revoked: integer('revoked', { mode: 'boolean' }).notNull().default(false),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_refresh_tokens_user').on(table.userId),
    index('idx_refresh_tokens_family').on(table.familyId),
    uniqueIndex('idx_refresh_tokens_hash').on(table.tokenHash),
  ],
);
