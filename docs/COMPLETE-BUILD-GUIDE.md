# Cultural Heritage Centre — Complete Build & Architecture Guide

**Version:** 2.0.0 — Gallery Concierge
**Package:** `com.twinfusion.culturalheritage`
**Framework:** React Native 0.83.2 + Expo SDK 55 (TypeScript)
**Backend:** Custom PHP API → WordPress Multisite MySQL (4 network sites)
**Production:** https://twinfusion.co.ke/cultural-heritage/

---

## Quick Start

```bash
# Clone
git clone https://github.com/twinfusion-ke/cultural-heritage-app.git
cd cultural-heritage-app

# Install
npm install

# Run on Android device/emulator
npx expo start --android

# Run on iOS simulator (macOS only)
npx expo start --ios

# Build Android APK
npx eas build --profile preview --platform android

# Build iOS IPA
npx eas build --profile preview --platform ios

# Push OTA update (no rebuild needed)
npx eas update --branch preview --platform android --environment preview --non-interactive
```

---

## Project Structure

```
cultural-heritage-app/
├── App.tsx                              # Root: ErrorBoundary, QueryClient, SafeArea, Navigation
├── index.ts                             # Expo entry point
├── app.json                             # Expo + EAS config (camera, location, av plugins)
├── eas.json                             # Build profiles (dev, preview, production)
├── package.json                         # Dependencies
├── api/                                 # PHP backend (deployed to server)
│   ├── index.php                        # 29 API endpoints
│   ├── seed.php                         # Database seeder
│   ├── check-blogs.php                  # Multisite blog ID checker
│   └── debug-images.php                 # Image URL debugger
├── src/
│   ├── api/                             # API client layer
│   │   ├── appApi.ts                    # Custom PHP API client (main)
│   │   ├── client.ts                    # Axios factory for WooCommerce REST
│   │   ├── hub.ts                       # Hub posts/pages hooks
│   │   ├── market.ts                    # Market products/categories hooks
│   │   ├── jewelry.ts                   # Vault products hooks
│   │   ├── gallery.ts                   # Gallery exhibitions/products hooks
│   │   ├── types.ts                     # AppProduct, AppPost, AppPage, etc.
│   │   └── index.ts                     # Barrel export
│   ├── components/                      # 20 reusable UI components
│   │   ├── AppHeader.tsx                # Logo, search, WhatsApp, cart badge, offline dot
│   │   ├── HeroCarousel.tsx             # Full-width image slider with auto-scroll + dots
│   │   ├── ProductCard.tsx              # 2-column product grid card with add-to-cart
│   │   ├── ProductQuickView.tsx         # Modal product detail (images, attributes, cart)
│   │   ├── FormModal.tsx                # Reusable popup form (booking, contact, visit, etc.)
│   │   ├── DatePicker.tsx               # Native month/day/year picker for forms
│   │   ├── YouTubeCard.tsx              # Inline YouTube video with thumbnail + play button
│   │   ├── ReviewsSection.tsx           # Horizontal traveler review cards
│   │   ├── HtmlRenderer.tsx             # WebView (native) / iframe (web) HTML renderer
│   │   ├── Toast.tsx                    # Success/error toast notification
│   │   ├── BlogCard.tsx                 # Blog post card (image, title, excerpt, date)
│   │   ├── ExhibitionCard.tsx           # Exhibition card (image, dates, status badge)
│   │   ├── ExhibitionBadge.tsx          # Now Showing / Upcoming / Past dot badge
│   │   ├── Button.tsx                   # Primary/outline/ghost button
│   │   ├── Divider.tsx                  # Gold accent line separator
│   │   ├── CartButton.tsx               # Floating cart icon with badge
│   │   ├── NetworkError.tsx             # Offline/error state with retry
│   │   ├── SafeLayout.tsx               # Edge-to-edge safe area wrapper
│   │   ├── ScreenContainer.tsx          # Standard screen wrapper with refresh
│   │   └── animated/                    # Animation wrappers
│   │       ├── FadeIn.tsx               # Fade + slide up on mount
│   │       ├── ScaleIn.tsx              # Scale bounce on mount
│   │       └── StaggerList.tsx          # Staggered children entrance
│   ├── screens/                         # 21 screen components
│   │   ├── home/HomeScreen.tsx          # Hero carousel, division banners, products, blog, reviews
│   │   ├── market/MarketScreen.tsx      # Hero slider, categories, product groups, video, banner
│   │   ├── vault/VaultScreen.tsx        # Dark luxury theme, jewelry grid, consultation CTA
│   │   ├── gallery/GalleryScreen.tsx    # Exhibitions (grouped by status), artworks, journal
│   │   ├── favorites/FavoritesScreen.tsx # Wishlist with add-to-cart and product detail
│   │   ├── more/MoreScreen.tsx          # Settings, currency, links, admin panel
│   │   ├── cart/CartScreen.tsx          # Grouped by site, quantity controls, WhatsApp checkout
│   │   ├── product/ProductDetailScreen.tsx # Image gallery, attributes, add-to-cart, compare
│   │   ├── search/SearchScreen.tsx      # Global search across all sites
│   │   ├── scanner/ScannerScreen.tsx    # QR code scanner (expo-camera)
│   │   ├── about/AboutScreen.tsx        # Full About with divisions, stats, videos, CTAs
│   │   ├── contact/ContactScreen.tsx    # Contact form + map + WhatsApp
│   │   ├── visit/VisitScreen.tsx        # Plan Your Visit with booking form + directions
│   │   ├── blog/BlogScreen.tsx          # Consolidated blog from all 4 sites
│   │   ├── legacy/LegacyScreen.tsx      # Animated timeline (1994–2024)
│   │   ├── auth/AuthScreen.tsx          # Login / Register with validation
│   │   ├── chat/ChatScreen.tsx          # In-app messaging with admin
│   │   ├── compare/CompareScreen.tsx    # Side-by-side product comparison (up to 3)
│   │   └── content/
│   │       ├── ContentScreen.tsx        # Generic WP page renderer
│   │       ├── PostDetailScreen.tsx     # Blog post detail with comments
│   │       └── ExhibitionDetailScreen.tsx # Exhibition detail with CTA
│   ├── navigation/
│   │   └── TabNavigator.tsx             # 6 bottom tabs + 15 shared stack screens
│   ├── stores/                          # 6 Zustand stores
│   │   ├── authStore.ts                 # User auth, sessions, event tracking
│   │   ├── cartStore.ts                 # Unified cart (AsyncStorage persist)
│   │   ├── compareStore.ts              # Product comparison (max 3)
│   │   ├── envStore.ts                  # Environment, API URLs (AsyncStorage persist)
│   │   ├── favoritesStore.ts            # Wishlist (AsyncStorage persist)
│   │   └── uiStore.ts                   # Online/offline, sync, currency
│   ├── db/                              # SQLite offline layer
│   │   ├── database.ts                  # SQLite init (WAL mode)
│   │   ├── schema.ts                    # CREATE TABLE statements
│   │   ├── contentCache.ts              # API response caching
│   │   └── outbox.ts                    # Offline mutation queue
│   ├── services/
│   │   ├── syncService.ts              # Background sync (NetInfo listener, outbox flush)
│   │   └── telemetry.ts                # Session/screen/action tracking
│   ├── hooks/
│   │   └── useNetworkStatus.ts         # Network connectivity hook
│   ├── config/
│   │   └── environment.ts              # Prod/staging URLs, API path
│   ├── theme/
│   │   ├── colors.ts                   # 4 division palettes + shared
│   │   ├── typography.ts               # Cormorant Garamond + Montserrat
│   │   ├── spacing.ts                  # 4-96px scale + layout constants
│   │   ├── theme.ts                    # Division theme mapping
│   │   └── index.ts                    # Barrel export
│   ├── types/
│   │   ├── wordpress.ts                # WPPost, WPPage, WPMedia
│   │   ├── woocommerce.ts              # WCProduct, WCOrder, WCCategory
│   │   └── exhibition.ts              # Exhibition CPT types
│   └── utils/
│       ├── currency.ts                 # formatPrice(), useCurrencyCode(), CURRENCIES
│       └── dates.ts                    # Exhibition status, date formatting, readingTime
└── assets/
    ├── fonts/
    │   ├── CormorantGaramond-*.ttf     # Heading font (Regular, Medium, Bold, Italic)
    │   └── Montserrat-*.ttf            # Body font (Regular, Medium, SemiBold, Bold)
    ├── icon.png                        # App icon (1024x1024)
    ├── splash-icon.png                 # Splash screen logo
    └── android-icon-*.png              # Adaptive icon layers
```

---

## Navigation Architecture

### Bottom Tab Navigator (6 tabs)

| Tab | Icon | Screen | Theme Color |
|-----|------|--------|-------------|
| Home | `home` | HomeScreen | Heritage Green #0e382c |
| Market | `basket` | MarketScreen | Warm Brown #3D2B1F |
| Vault | `diamond` | VaultScreen | Obsidian #0A0A14 |
| Gallery | `color-palette` | GalleryScreen | Charcoal #1A1A1A |
| Favorites | `heart` | FavoritesScreen | Heritage Green |
| More | `menu` | MoreScreen | Heritage Green |

### Shared Stack Screens (accessible from any tab)

| Route | Screen | Animation |
|-------|--------|-----------|
| Cart | CartScreen | slide_from_bottom |
| ProductDetail | ProductDetailScreen | slide_from_right |
| Content | ContentScreen | slide_from_right |
| PostDetail | PostDetailScreen | slide_from_right |
| ExhibitionDetail | ExhibitionDetailScreen | slide_from_right |
| Search | SearchScreen | slide_from_right |
| Blog | BlogScreen | slide_from_right |
| About | AboutScreen | slide_from_right |
| Contact | ContactScreen | slide_from_right |
| Legacy | LegacyScreen | slide_from_right |
| Visit | VisitScreen | slide_from_right |
| Auth | AuthScreen | slide_from_bottom |
| Chat | ChatScreen | slide_from_right |
| Compare | CompareScreen | slide_from_bottom |
| Scanner | ScannerScreen | slide_from_bottom |

---

## PHP API Endpoints

**Base URL:** `https://twinfusion.co.ke/cultural-heritage/app-api/`

All endpoints use `?action=<name>` query parameter.

### Content Endpoints

| Action | Method | Params | Returns |
|--------|--------|--------|---------|
| `config` | GET | — | App config, site info, branding |
| `products` | GET | `site`, `per_page`, `page`, `category`, `search`, `orderby` | Product list |
| `product` | GET | `site`, `id` | Single product |
| `categories` | GET | `site` | Product categories |
| `posts` | GET | `site`, `per_page`, `page` | Blog posts |
| `post` | GET | `site`, `slug` | Single post |
| `pages` | GET | `site` | All pages |
| `page` | GET | `site`, `slug` | Single page |
| `exhibitions` | GET | — | All exhibitions with status |
| `exhibition` | GET | `slug` | Single exhibition |
| `sliders` | GET | — | Hero carousel slides |
| `search` | GET | `q`, `site` | Search results |

### Auth Endpoints

| Action | Method | Params | Returns |
|--------|--------|--------|---------|
| `register` | POST | `name`, `email`, `password`, `phone`, `device_info`, `location` | User + token |
| `login` | POST | `email`, `password`, `device_info`, `location` | User + token |
| `profile` | GET/POST | `token`, `preferences` (optional) | User profile |
| `logout` | POST | `token` | Success |

### Communication Endpoints

| Action | Method | Params | Returns |
|--------|--------|--------|---------|
| `chat_send` | POST | `token`, `message`, `name`, `email` | Message ID |
| `chat_messages` | GET | `token` | Message history |
| `chat_read` | POST | `token` | Marks replies as read |
| `chat_unread` | GET | `token` | Unread count |
| `submit_comment` | POST | `post_title`, `comment`, `name`, `email`, `site` | Submitted for moderation |
| `get_comments` | GET | `post_title`, `site` | Approved comments |
| `submit_form` | POST | `form_type`, `name`, `email`, `phone`, `message`, ... | Email sent |

### Analytics Endpoints

| Action | Method | Params | Returns |
|--------|--------|--------|---------|
| `track` | POST | `token`, `event_type`, `screen`, `product_id`, `site`, `metadata` | Success |
| `recommendations` | GET | `token` | Personalized products |

### Reservation Endpoints (Gallery Concierge)

| Action | Method | Params | Returns |
|--------|--------|--------|---------|
| `reserve` | POST | `token`, `product_id`, `site` | Reservation with timer |
| `reservations` | GET | `token` | Active reservations |
| `master_qr` | GET | `token` | QR code data for checkout |
| `staff_lookup` | GET | `qr_data` | Cart items for staff |

---

## WordPress Multisite Architecture

### Network Sites (blog_id mapping)

| Blog ID | Site | Path | Table Prefix | Purpose |
|---------|------|------|--------------|---------|
| 1 | Hub | `/cultural-heritage/` | `wp_` | Main site, blog, pages |
| 2 | Market | `/cultural-heritage/market/` | `wp_2_` | Handcrafts WooCommerce |
| 3 | Jewelry | `/cultural-heritage/jewelry/` | `wp_3_` | Tanzanite WooCommerce |
| 4 | Gallery | `/cultural-heritage/gallery/` | `wp_4_` | Art WooCommerce + Exhibitions CPT |

### Custom Database Tables

```sql
-- User accounts (separate from WP users)
ch_app_users (id, name, email, phone, password_hash, avatar_url, preferences, location, device_info, last_login, created_at, status)

-- Session management (30-day tokens)
ch_app_sessions (id, user_id, token, device_info, ip_address, location, created_at, expires_at)

-- Analytics events
ch_app_analytics (id, user_id, session_token, event_type, screen, product_id, site, metadata, ip_address, location, device_info, created_at)

-- In-app messaging
ch_app_messages (id, user_id, user_name, user_email, message, reply, replied_by, replied_at, is_read, created_at)
```

### WordPress Admin Plugins (mu-plugins)

| File | Purpose |
|------|---------|
| `ch-app-sliders.php` | Admin page to manage hero carousel slides |
| `ch-app-messages.php` | Admin page to view/reply to in-app messages |

---

## State Management

### Zustand Stores

| Store | Persistence | Fields |
|-------|-------------|--------|
| `authStore` | AsyncStorage | user, token, isLoggedIn, login(), register(), logout(), trackEvent() |
| `cartStore` | AsyncStorage | items[], addItem(), removeItem(), updateQuantity(), clearCart(), getTotal(), getSiteItems() |
| `envStore` | AsyncStorage | env (baseDomain, keys), urls (hub/market/jewelry/gallery), setEnvironment() |
| `favoritesStore` | AsyncStorage | items[], toggle(), isFavorite(), clear() |
| `compareStore` | Memory | items[] (max 3), add(), remove(), clear() |
| `uiStore` | Memory | isOnline, isSyncing, pendingSyncCount, currency, setCurrency() |

### React Query Configuration

```typescript
staleTime: 30_000          // 30 seconds
gcTime: 86_400_000         // 24 hours
networkMode: 'offlineFirst' // Serve cache first
retry: 1
```

---

## Offline-First Architecture

```
User Action → React Query Cache (30s stale)
                    ↓ miss
              Custom PHP API (live fetch)
                    ↓ success
              SQLite Cache (contentCache table)
                    ↓ fail (offline)
              SQLite Cache (serve stale)

Mutations → SQLite Outbox (pending queue)
                    ↓ online
              Sync Service (NetInfo listener)
                    ↓
              PHP API (POST/PUT)
```

### Cache Strategy

| Data Type | SQLite TTL | React Query Stale |
|-----------|-----------|-------------------|
| Products | 1 hour | 30 seconds |
| Posts | 2 hours | 30 seconds |
| Pages | 4 hours | 60 minutes |
| Categories | 4 hours | 60 minutes |
| Exhibitions | 2 hours | 15 minutes |
| Config | 24 hours | 60 minutes |
| Sliders | 1 hour | 30 seconds |

---

## Design System

### Typography

| Style | Font | Size | Usage |
|-------|------|------|-------|
| heroTitle | Cormorant Garamond Bold | 48px | Home hero |
| h1 | Cormorant Garamond Bold | 32px | Section headings |
| h2 | Cormorant Garamond Bold | 24px | Card titles |
| h3 | Cormorant Garamond Medium | 20px | Subtitles |
| body | Montserrat Regular | 15px | Main text |
| bodySmall | Montserrat Regular | 13px | Secondary text |
| label | Montserrat SemiBold | 10px | Uppercase eyebrows |
| button | Montserrat SemiBold | 12px | CTA buttons |
| price | Montserrat SemiBold | 16px | Product prices |

### Color Palettes

| Site | Primary | Accent | Background |
|------|---------|--------|------------|
| Hub | #0e382c | #C5A059 (Gold) | #F5F2ED |
| Market | #3D2B1F | #D4813B (Terracotta) | #FFF8F0 |
| Vault | #0A0A14 | #C9A962 (Gold) | #FAFAFA |
| Gallery | #1A1A1A | #C5A059 (Gold) | #FAFAF8 |

### Spacing Scale

```
xs: 4, sm: 8, md: 16, lg: 24, xl: 32, 2xl: 48, 3xl: 64, 4xl: 96
```

---

## Currency System

Supports 3 currencies with live conversion:

| Code | Symbol | Rate (to USD) |
|------|--------|---------------|
| USD | $ | 1 |
| KES | KSh | 129 |
| TZS | TSh | 2,650 |

Changeable in **More > Currency**. All product prices convert instantly across all screens.

---

## Build & Deployment

### EAS Build Profiles

| Profile | Output | Use Case |
|---------|--------|----------|
| `development` | APK | Dev build with Expo Dev Client |
| `preview` | APK | Direct install for testing |
| `production` | AAB | Google Play Store submission |

### Build Commands

```bash
# Android APK (testing)
npx eas build --profile preview --platform android

# Android AAB (Play Store)
npx eas build --profile production --platform android

# iOS (App Store)
npx eas build --profile production --platform ios

# OTA Update (instant, no rebuild)
npx eas update --branch preview --platform android --environment preview --non-interactive
```

### iOS Build Requirements

1. Apple Developer Account ($99/year)
2. Provisioning profile + certificates (EAS handles this)
3. App Store Connect setup

```bash
# First iOS build — EAS will prompt for Apple credentials
npx eas build --profile preview --platform ios

# Submit to App Store
npx eas submit --platform ios
```

### EAS Accounts

| Account | Username | Email |
|---------|----------|-------|
| Primary | eagesa | agesaeric@gmail.com |
| Secondary | e-agesa | eamosota@gmail.com |

### Environment Switching

The app supports runtime environment switching via the hidden admin panel (5 taps on version number in More tab):

| Environment | Domain |
|-------------|--------|
| Production | twinfusion.co.ke/cultural-heritage |
| Staging | localhost/cultural-heritage-wp |

---

## Feature Inventory (v2.0.0)

### Core Features (40+)

1. 6-tab bottom navigation with dynamic theming
2. Hero image carousel (6 slides, auto-scroll, WP-managed)
3. Product grid (2-column) with add-to-cart
4. Product detail screen with image gallery
5. Unified cart across 3 WooCommerce sites
6. WhatsApp checkout with pre-filled order message
7. Offline cart persistence (AsyncStorage)
8. Offline order queuing (SQLite outbox)
9. Background sync on network restoration
10. Category filter chips (horizontal scroll)
11. Pull-to-refresh on all screens
12. Global search across all content
13. Currency switching (USD/KES/TZS)
14. Favorites / Wishlist (persisted)
15. Product comparison (up to 3)
16. Recently viewed products
17. Blog from all 4 sites
18. Blog post detail with comments
19. Comments sync to WordPress admin
20. Exhibition management (Now Showing / Upcoming / Past)
21. Exhibition detail with hero image + CTAs
22. About Us with divisions, stats, videos
23. Contact page with form + map + WhatsApp
24. Plan Your Visit with booking form
25. Our Legacy animated timeline
26. In-app chat messaging
27. Chat replies from WordPress admin
28. User registration / login
29. Session management (30-day tokens)
30. Analytics tracking (screens, products, events)
31. YouTube video cards (inline play)
32. Traveler reviews section
33. Form modals (booking, consultation, visit, contact, enquiry)
34. Date picker on forms
35. QR code scanner (expo-camera)
36. Entrance animations (FadeIn, ScaleIn, Stagger)
37. Edge-to-edge layout with safe area insets
38. Error boundary crash protection
39. Content pages rendered from WordPress HTML
40. Hidden admin panel (environment switching)
41. OTA updates (instant code pushes)
42. Add-to-cart toast notifications
43. Tab badges (product counts)
44. Newsletter page
45. WP admin slider manager plugin
46. WP admin messages plugin

---

## Xcode / iOS Setup

### Prerequisites

- macOS with Xcode 15+
- Apple Developer Account
- CocoaPods (`sudo gem install cocoapods`)

### Steps

```bash
# 1. Clone the project
git clone https://github.com/twinfusion-ke/cultural-heritage-app.git
cd cultural-heritage-app
npm install

# 2. Login to EAS
npx eas login

# 3. Build iOS
npx eas build --profile preview --platform ios

# 4. Or build locally with Xcode
npx expo prebuild --platform ios
cd ios
pod install
open CulturalHeritage.xcworkspace
# Select your device/simulator and press ⌘+R to run
```

### iOS-Specific Configuration (already in app.json)

```json
{
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.twinfusion.culturalheritage",
    "infoPlist": {
      "NSCameraUsageDescription": "Scan QR codes on artworks.",
      "NSLocationWhenInUseUsageDescription": "Tag your location when scanning.",
      "NSMicrophoneUsageDescription": "Record audio feedback."
    }
  }
}
```

### Local iOS Build (without EAS)

```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Install CocoaPods
cd ios && pod install && cd ..

# Open in Xcode
open ios/CulturalHeritage.xcworkspace

# In Xcode:
# 1. Select your Team in Signing & Capabilities
# 2. Select your device or simulator
# 3. Press ⌘+R to build and run
# 4. For App Store: Product > Archive
```

---

## Server Deployment

### PHP API Deployment

The API file (`api/index.php`) must be deployed to:
```
public_html/cultural-heritage/app-api/index.php
```

Deploy via SFTP or the deploy script:
```bash
node deploy-theme.js
```

### WordPress Plugins Deployment

Copy mu-plugins to:
```
public_html/cultural-heritage/wp-content/mu-plugins/
├── ch-app-sliders.php      # Slider management
└── ch-app-messages.php      # Chat message replies
```

---

## Environment Variables

No `.env` file needed. All configuration is runtime-switchable via the admin panel. Defaults:

```
BASE_DOMAIN=twinfusion.co.ke/cultural-heritage
API_PATH=/app-api
WC_CONSUMER_KEY=(set in admin panel)
WC_CONSUMER_SECRET=(set in admin panel)
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| App crashes on open | Clear Data in Android Settings > Apps > Cultural Heritage |
| Content not showing | Check API: `curl https://twinfusion.co.ke/cultural-heritage/app-api/?action=config` |
| Images not loading | Check WP Media Library URLs match the `_wp_attached_file` meta |
| OTA not applying | Close app completely (swipe away), open, close, open again |
| Build fails on EAS | Check free tier limit, switch accounts, or build locally |
| Camera not working | Needs native APK rebuild (not OTA), grant camera permission |
| Products showing $1 | Check WooCommerce `_price` postmeta in correct blog table |

---

## Repositories

- **Mobile App:** https://github.com/twinfusion-ke/cultural-heritage-app
- **WordPress:** https://github.com/twinfusion-ke/cultural-heritage-arusha

## Contact

**Cultural Heritage Centre**
Dodoma Road, Arusha, Tanzania
Phone: +255 786 454 999
WhatsApp: wa.me/255786454999
Email: twinfusion2023@gmail.com

*App v2.0.0 — Built March–April 2026*
