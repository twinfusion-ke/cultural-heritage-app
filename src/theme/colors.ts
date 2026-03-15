/**
 * Cultural Heritage Centre — Brand Colors
 *
 * Each sub-site has its own color identity.
 * These map directly to the Tailwind config in the WordPress themes.
 */

export const colors = {
  /** Shared across all sites */
  shared: {
    gold: '#C5A059',
    goldLight: '#D4B96E',
    parchment: '#F5F2ED',
    tanzanite: '#1E2F97',
    terracotta: '#D4813B',
    white: '#FFFFFF',
    black: '#000000',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
  },

  /** Site 1: Main Hub — Heritage green + gold */
  hub: {
    primary: '#0e382c',
    primaryLight: '#145540',
    primaryDark: '#0a2b22',
    accent: '#C5A059',
    background: '#F5F2ED',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },

  /** Site 2: The Market — Warm brown + terracotta */
  market: {
    primary: '#3D2B1F',
    primaryLight: '#5C3D2E',
    primaryDark: '#2A1D15',
    accent: '#D4813B',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },

  /** Site 3: The Vault — Near-black + tanzanite */
  vault: {
    primary: '#0A0A14',
    primaryLight: '#12121F',
    primaryDark: '#050508',
    accent: '#C9A962',
    accentBlue: '#1E2F97',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },

  /** Site 4: Art Gallery — Museum black + gold */
  gallery: {
    primary: '#1A1A1A',
    primaryLight: '#2C2C2C',
    primaryDark: '#111111',
    accent: '#C5A059',
    background: '#FAFAF8',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },

  /** Exhibition status badges */
  status: {
    nowShowing: '#16A34A',
    upcoming: '#D97706',
    past: '#6B7280',
  },
} as const;
