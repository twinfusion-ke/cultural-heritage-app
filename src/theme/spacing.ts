/**
 * Spacing & Layout Constants
 *
 * Consistent spacing scale used across all screens.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const;

export const layout = {
  /** Max content width */
  maxWidth: 1400,
  /** Horizontal page padding */
  paddingHorizontal: 24,
  /** Card border radius */
  borderRadius: 2,
  /** Card gap in grids */
  cardGap: 16,
  /** Section vertical padding */
  sectionPadding: 64,
  /** Header height */
  headerHeight: 56,
  /** Tab bar height */
  tabBarHeight: 64,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
