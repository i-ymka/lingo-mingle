export interface Language {
  code: string;
  name: string;
}

export type UserRole = 'A' | 'B';

export interface User {
  id: string;
  displayName: string;
  nativeLang: Language;
  partnerNativeLang: Language;
  pivotLang: Language;
  activePairId?: string; // Currently selected pair for multi-pair support
  role?: UserRole; // 'A' or 'B' - determined by position in current pair
}

export interface Pair {
  id: string;
  createdAt: string;
  inviteCode: string;
  inviteCodeExpiresAt: string | null; // ISO timestamp when invite code expires (5 minutes after creation)
  inviteCodeUsed: boolean; // True if invite code has been used once
  userIds: [string, string | null];
}

export type EntryStatus = 'draft' | 'waiting_partner_audio' | 'ready';

export interface Entry {
  id: string;
  pairId: string;
  
  text_native_A: string;
  text_native_B: string;
  text_pivot: string;

  // Store audio as base64 strings
  audio_A_native: string | null;
  audio_B_native: string | null;
  
  status: EntryStatus;

  // Spaced Repetition System state for each partner
  srs_box_A: number;
  srs_box_B: number;
  lastReviewed_A: string | null;
  lastReviewed_B: string | null;

  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
  isOffline?: boolean;
}

export type SrsDecision = 'know' | 'unsure' | 'dont_know';

export type ThemeName = 'meadow' | 'daybreak' | 'twilight' | 'forest';