// Centralized exports for profile types
export * from './entities';
export * from './dtos';
export * from './enums';

// ─── Saved Address ────────────────────────────────────────────────────────────
export interface SavedAddress {
  id: string;             // mapped from backend _id
  label: 'home' | 'work' | 'other';
  addressLine: string;    // số nhà + tên đường  (backend: addressLine)
  ward: string;           // phường / xã
  district: string;       // quận / huyện
  city: string;           // tỉnh / thành phố
  isDefault: boolean;
}

export const ADDRESS_LABEL_MAP: Record<SavedAddress['label'], { text: string; icon: string }> = {
  home: { text: 'Nhà', icon: 'home' },
  work: { text: 'Công ty', icon: 'briefcase' },
  other: { text: 'Khác', icon: 'map-pin' },
};

// Legacy aliases for backward compatibility
export type {
  CreateActivityDto as CreateActivityData,
  UpdateUserProfileDto as UpdateUserProfileData,
  UserStatsDto as UserStats
} from './dtos';