/**
 * Typography System — Cultural Heritage Centre
 *
 * Corporate luxury typography using Cormorant Garamond (headings)
 * and Montserrat (body). Matches the website design system.
 */

export const fonts = {
  heading: {
    regular: 'CormorantGaramond-Regular',
    medium: 'CormorantGaramond-Medium',
    bold: 'CormorantGaramond-Bold',
    italic: 'CormorantGaramond-Italic',
  },
  body: {
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semiBold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
  },
} as const;

/** Font file map for expo-font useFonts() */
export const fontAssets = {
  'CormorantGaramond-Regular': require('../../assets/fonts/CormorantGaramond-Regular.ttf'),
  'CormorantGaramond-Medium': require('../../assets/fonts/CormorantGaramond-Medium.ttf'),
  'CormorantGaramond-Bold': require('../../assets/fonts/CormorantGaramond-Bold.ttf'),
  'CormorantGaramond-Italic': require('../../assets/fonts/CormorantGaramond-Italic.ttf'),
  'Montserrat-Regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
  'Montserrat-Medium': require('../../assets/fonts/Montserrat-Medium.ttf'),
  'Montserrat-SemiBold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
  'Montserrat-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
};

/** Pre-defined text styles */
export const textStyles = {
  /** Hero headline — 48px Cormorant */
  heroTitle: {
    fontFamily: fonts.heading.regular,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  /** Section heading — 32px Cormorant */
  h1: {
    fontFamily: fonts.heading.regular,
    fontSize: 32,
    lineHeight: 38,
  },
  /** Card title — 24px Cormorant */
  h2: {
    fontFamily: fonts.heading.regular,
    fontSize: 24,
    lineHeight: 30,
  },
  /** Subtitle — 20px Cormorant */
  h3: {
    fontFamily: fonts.heading.regular,
    fontSize: 20,
    lineHeight: 26,
  },
  /** Body text — 15px Montserrat */
  body: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  /** Small body — 13px Montserrat */
  bodySmall: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  /** Eyebrow / label — 10px Montserrat SemiBold, uppercase */
  label: {
    fontFamily: fonts.body.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 2.5,
    textTransform: 'uppercase' as const,
  },
  /** Button text — 12px Montserrat SemiBold, uppercase */
  button: {
    fontFamily: fonts.body.semiBold,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  /** Price display — 16px Montserrat SemiBold */
  price: {
    fontFamily: fonts.body.semiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  /** Caption — 11px Montserrat */
  caption: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    lineHeight: 16,
  },
} as const;
