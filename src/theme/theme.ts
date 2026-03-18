/**
 * Theme — Centralized theme object for the four Cultural Heritage divisions.
 *
 * Each division has its own palette, and there's a shared accent (gold).
 * This is the single source of truth for dynamic theming per tab.
 */

import { colors } from './colors';

export type DivisionKey = 'hub' | 'market' | 'vault' | 'gallery';

export interface DivisionTheme {
  /** Tab bar / header background */
  primary: string;
  /** Lighter shade for pressed states */
  primaryLight: string;
  /** Accent color for active tab indicator, badges */
  accent: string;
  /** Screen background */
  background: string;
  /** Light text on dark backgrounds */
  textLight: string;
  /** Status bar style */
  statusBarStyle: 'light-content' | 'dark-content';
}

export const divisionThemes: Record<DivisionKey, DivisionTheme> = {
  hub: {
    primary: colors.hub.primary,         // #0e382c Heritage Green
    primaryLight: colors.hub.primaryLight,
    accent: colors.shared.gold,          // #C5A059
    background: colors.hub.background,
    textLight: colors.shared.parchment,
    statusBarStyle: 'light-content',
  },
  market: {
    primary: colors.market.primary,      // #3D2B1F Warm Brown
    primaryLight: colors.market.primaryLight,
    accent: colors.market.accent,        // #D4813B Terracotta
    background: colors.market.background,
    textLight: '#FFF8F0',
    statusBarStyle: 'light-content',
  },
  vault: {
    primary: colors.vault.primary,       // #0A0A14 Obsidian
    primaryLight: colors.vault.primaryLight,
    accent: colors.vault.accent,         // #C9A962 Rich Gold
    background: colors.vault.background,
    textLight: '#FAFAFA',
    statusBarStyle: 'light-content',
  },
  gallery: {
    primary: colors.gallery.primary,     // #1A1A1A Charcoal
    primaryLight: colors.gallery.primaryLight,
    accent: colors.shared.gold,          // #C5A059
    background: colors.gallery.background,
    textLight: '#FAFAF8',
    statusBarStyle: 'light-content',
  },
} as const;

/** Gold accent shared across all divisions for the active tab indicator */
export const ACTIVE_TAB_GOLD = '#C5A059';

/** Map tab route names to division keys */
export const routeToDivision: Record<string, DivisionKey> = {
  Home: 'hub',
  Market: 'market',
  Vault: 'vault',
  Gallery: 'gallery',
  Favorites: 'hub',
  More: 'hub',
};
