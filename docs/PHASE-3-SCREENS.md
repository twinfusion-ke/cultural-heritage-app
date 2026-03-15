# Phase 3: Hub Development — Live Production Data

**Date:** March 15, 2026

---

## 1. API Hooks Created

| File | Site | Hooks |
|------|------|-------|
| `api/hub.ts` | Main Hub | `useHubPosts`, `useHubPost`, `useHubPage` |
| `api/market.ts` | Market | `useMarketProducts`, `useMarketCategories`, `useMarketProduct`, `useMarketPosts` |
| `api/jewelry.ts` | Jewelry | `useJewelryProducts`, `useJewelryCategories`, `useJewelryProduct`, `useJewelryPosts` |
| `api/gallery.ts` | Gallery | `useExhibitions`, `useExhibition`, `useExhibitionTypes`, `useGalleryProducts`, `useGalleryPosts` |

All hooks use TanStack Query with:
- `staleTime: 5min` (products, posts)
- `staleTime: 15min` (exhibitions)
- `staleTime: 1hr` (categories, static pages)
- `networkMode: offlineFirst` (serve cache, then revalidate)

## 2. Screens Built

### Tab 1: Home (HomeScreen)
- Hero section with heritage branding
- Stats bar (30+ years, 50K+ visitors, 5K+ artworks)
- Three Pillars cards (Market, Vault, Gallery — navigate to tabs)
- Heritage Stories (3 latest blog posts from Hub API)
- Visit Info (address, hours, phone, WhatsApp CTA)

### Tab 2: Market (MarketScreen)
- Horizontal category chip filter (All, Handcrafts, Spices, etc.)
- 2-column product grid from WC REST API
- Pull-to-refresh
- WhatsApp enquiry on product tap
- Empty state with "Browse on Website" fallback

### Tab 3: Vault (VaultScreen)
- Hero banner ("Rare Gemstones & Fine Jewelry")
- 2-column product grid with stone/carat subtitles
- WhatsApp enquiry with full attribute details
- Sticky "Book Private Consultation" CTA bar
- Empty state with consultation booking

### Tab 4: Gallery (GalleryScreen)
- Exhibitions grouped: Now Showing (full cards), Upcoming (horizontal scroll), Past
- ExhibitionCard with dynamic status badges
- Featured Artworks grid (6 products with artist attribution)
- Gallery Journal (3 latest posts)
- Visit CTA with directions + call buttons

### Tab 5: More (MoreScreen)
- Online/offline status indicator
- Pending sync count with manual sync button
- Cart item count
- Discover menu (About, Legacy, Visit, Contact, WhatsApp)
- Knowledge menu (Tanzanite Guide, Art Guide, Certification, Care)
- Legal menu (Privacy, Terms, Shipping)
- App settings (Notifications, Language, Currency)
- **Hidden admin panel** (5-tap on version): environment switching, WC credentials, POS API key

## 3. Data Flow

```
Production DB (twinfusion.co.ke)
       ↓
WP REST API / WC REST API
       ↓
TanStack Query (fetch + cache)
       ↓
Screen Component (render)
       ↓
User Action (add to cart, enquire)
       ↓
Zustand Cart Store (MMKV) OR WhatsApp deep-link
```

## 4. Reuse Guide

To connect to a different WordPress Multisite:
1. Update `BASE_DOMAIN` in environment config
2. Adjust sub-site paths in `src/config/environment.ts`
3. Update WC consumer keys via admin panel (5-tap on version)
4. API hooks auto-derive URLs from the active environment
