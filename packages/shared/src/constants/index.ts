export const WINE_COLORS = [
  'red',
  'white',
  'rosé',
  'sparkling',
  'dessert',
  'fortified',
  'orange',
] as const;

export const BOTTLE_SIZES = ['375ml', '750ml', '1.5L', '3L', 'other'] as const;

export const BOTTLE_STATUSES = ['in_stock', 'consumed', 'gifted', 'sold', 'spoiled'] as const;

export const USER_ROLES = ['admin', 'member'] as const;

export type WineColor = (typeof WINE_COLORS)[number];
export type BottleSize = (typeof BOTTLE_SIZES)[number];
export type BottleStatus = (typeof BOTTLE_STATUSES)[number];
export type UserRole = (typeof USER_ROLES)[number];
