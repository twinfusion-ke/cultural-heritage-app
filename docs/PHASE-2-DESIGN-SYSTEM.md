# Phase 2: Design System Implementation

**Date:** March 15, 2026

---

## 1. Custom Fonts

Downloaded directly from Google Fonts CDN to `assets/fonts/`:

| Font | Weights | Usage |
|------|---------|-------|
| Cormorant Garamond | Regular, Medium, Bold, Italic | Headings (h1–h3, hero titles) |
| Montserrat | Regular, Medium, SemiBold, Bold | Body text, labels, buttons, prices |

**Loading:** `useFonts()` in App.tsx with `fontAssets` map from `src/theme/typography.ts`.

## 2. Typography Scale

| Style | Font | Size | Weight | Use Case |
|-------|------|------|--------|----------|
| `heroTitle` | Cormorant | 48px | Regular | Home hero, splash |
| `h1` | Cormorant | 32px | Regular | Section headings |
| `h2` | Cormorant | 24px | Regular | Card titles, screen headers |
| `h3` | Cormorant | 20px | Regular | Subtitles, product names |
| `body` | Montserrat | 15px | Regular | Main body text |
| `bodySmall` | Montserrat | 13px | Regular | Descriptions, excerpts |
| `label` | Montserrat | 10px | SemiBold | Eyebrows, uppercase labels |
| `button` | Montserrat | 12px | SemiBold | Button text, uppercase |
| `price` | Montserrat | 16px | SemiBold | Product prices |
| `caption` | Montserrat | 11px | Regular | Dates, metadata |

## 3. Color System

Four site-specific palettes + shared tokens. See `src/theme/colors.ts`.

## 4. Spacing Scale

```
xs: 4   sm: 8   md: 16   lg: 24   xl: 32   2xl: 48   3xl: 64   4xl: 96
```

## 5. Components Built

| Component | Props | Purpose |
|-----------|-------|---------|
| `Button` | title, variant(primary/outline/ghost), size(sm/md/lg), color, loading | CTA buttons |
| `ProductCard` | name, price, imageUrl, site, subtitle, saleBadge | Product grid items |
| `ExhibitionBadge` | startDate, endDate | Status dot (Now Showing/Upcoming/Past) |
| `ExhibitionCard` | title, imageUrl, startDate, endDate, excerpt | Exhibition list items |
| `BlogCard` | title, excerpt, imageUrl, date, category | Journal/blog cards |
| `ScreenContainer` | site, title, scrollable, refreshing, onRefresh | Standard screen wrapper |
| `Divider` | color, width, marginVertical | Gold accent line |

## 6. Reuse Guide

To adapt this design system for another project:
1. Update `src/theme/colors.ts` with new brand colors
2. Swap font files in `assets/fonts/` and update `typography.ts`
3. Adjust `spacing.ts` values if needed
4. Components accept color props — no hardcoded site references
