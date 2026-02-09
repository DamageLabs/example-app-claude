import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshToken(
  db: BetterSQLite3Database<typeof schema>,
  userId: number,
  token: string,
  familyId: string,
  expiresAt: Date,
) {
  const tokenHash = hashToken(token);
  db.insert(schema.refreshTokens)
    .values({
      userId,
      tokenHash,
      familyId,
      expiresAt: expiresAt.toISOString(),
    })
    .run();
}

export async function rotateRefreshToken(
  db: BetterSQLite3Database<typeof schema>,
  oldToken: string,
  newToken: string,
  userId: number,
  expiresAt: Date,
): Promise<{ valid: boolean; familyId?: string }> {
  const oldHash = hashToken(oldToken);

  // Find the old token
  const existing = db
    .select()
    .from(schema.refreshTokens)
    .where(eq(schema.refreshTokens.tokenHash, oldHash))
    .get();

  if (!existing) {
    return { valid: false };
  }

  // Check if token was already revoked (reuse detection)
  if (existing.revoked) {
    // Revoke the entire family - potential token theft
    db.update(schema.refreshTokens)
      .set({ revoked: true })
      .where(eq(schema.refreshTokens.familyId, existing.familyId))
      .run();
    return { valid: false };
  }

  // Check expiry
  if (new Date(existing.expiresAt) < new Date()) {
    return { valid: false };
  }

  // Check user matches
  if (existing.userId !== userId) {
    return { valid: false };
  }

  // Revoke the old token
  db.update(schema.refreshTokens)
    .set({ revoked: true })
    .where(eq(schema.refreshTokens.id, existing.id))
    .run();

  // Store the new token in the same family
  const newHash = hashToken(newToken);
  db.insert(schema.refreshTokens)
    .values({
      userId,
      tokenHash: newHash,
      familyId: existing.familyId,
      expiresAt: expiresAt.toISOString(),
    })
    .run();

  return { valid: true, familyId: existing.familyId };
}

export async function revokeRefreshToken(
  db: BetterSQLite3Database<typeof schema>,
  token: string,
): Promise<boolean> {
  const tokenHash = hashToken(token);
  const result = db
    .update(schema.refreshTokens)
    .set({ revoked: true })
    .where(
      and(
        eq(schema.refreshTokens.tokenHash, tokenHash),
        eq(schema.refreshTokens.revoked, false),
      ),
    )
    .run();
  return result.changes > 0;
}
