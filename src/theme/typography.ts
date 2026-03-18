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
    fontSize: 49,
    lineHeight: 54,
    letterSpacing: -0.5,
  },
  /** Section heading — 33px Cormorant */
  h1: {
    fontFamily: fonts.heading.regular,
    fontSize: 33,
    lineHeight: 40,
  },
  /** Card title — 25px Cormorant */
  h2: {
    fontFamily: fonts.heading.regular,
    fontSize: 25,
    lineHeight: 32,
  },
  /** Subtitle — 21px Cormorant */
  h3: {
    fontFamily: fonts.heading.regular,
    fontSize: 21,
    lineHeight: 28,
  },
  /** Body text — 16px Montserrat */
  body: {
    fontFamily: fonts.body.regular,
    fontSize: 16,
    lineHeight: 25,
  },
  /** Small body — 14px Montserrat */
  bodySmall: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  /** Eyebrow / label — 11px Montserrat SemiBold, uppercase */
  label: {
    fontFamily: fonts.body.semiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 2.5,
    textTransform: 'uppercase' as const,
  },
  /** Button text — 13px Montserrat SemiBold, uppercase */
  button: {
    fontFamily: fonts.body.semiBold,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  /** Price display — 17px Montserrat SemiBold */
  price: {
    fontFamily: fonts.body.semiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  /** Caption — 12px Montserrat */
  caption: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    lineHeight: 17,
  },
} as const;
