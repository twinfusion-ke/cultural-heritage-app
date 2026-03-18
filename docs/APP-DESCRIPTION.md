# Cultural Heritage Centre — Mobile App

## App Overview

**Cultural Heritage** is a native Android (and future iOS) mobile application for the Cultural Heritage Centre in Arusha, Tanzania — one of East Africa's most distinguished cultural destinations, operating since 1994.

The app serves as a unified mobile storefront and information hub for the Centre's four distinct divisions: the main institutional hub, The Market (handcrafts & artifacts), The Vault (tanzanite & fine jewelry), and The Art Gallery (contemporary & traditional fine art with rotating exhibitions).

**Package:** `com.twinfusion.culturalheritage`
**Platform:** Android 14+ (iOS planned)
**Framework:** React Native + Expo (TypeScript)
**Backend:** Custom PHP API reading directly from WordPress Multisite database
**OTA Updates:** EAS Update (instant code pushes without APK rebuild)

---

## Architecture

### Custom PHP API (`/app-api/`)

The app uses a standalone PHP API that reads directly from the WordPress multisite MySQL database. No WooCommerce REST API keys are required.

**Endpoints:**

| Endpoint | Description |
|----------|-------------|
| `?action=products&site=market` | Products from any site |
| `?action=categories&site=market` | Product categories |
| `?action=product&site=market&id=123` | Single product |
| `?action=posts&site=hub` | Blog posts |
| `?action=pages&site=hub` | WordPress pages |
| `?action=page&site=hub&slug=about` | Single page by slug |
| `?action=exhibitions` | Gallery exhibitions (CPT) |
| `?action=sliders` | Hero carousel slides (from wp_options) |
| `?action=search&q=term` | Global search across all 4 sites |
| `?action=submit_form` | Form submission via email |
| `?action=config` | App configuration, assets, contact info |

**Multisite Blog ID Mapping:**

| Site | Blog ID | Table Prefix | Path |
|------|---------|-------------|------|
| Hub | 1 | `wp_` | `/cultural-heritage/` |
| Market | 2 | `wp_2_` | `/cultural-heritage/market/` |
| Jewelry | 3 | `wp_3_` | `/cultural-heritage/jewelry/` |
| Gallery | 4 | `wp_4_` | `/cultural-heritage/gallery/` |

### Offline-First Design

- **SQLite Content Cache** — All API responses cached locally with configurable TTL per content type (products 5min, pages 15min)
- **Cache cleared on app start** — Ensures fresh WordPress content on every launch
- **Offline fallback** — If network fails, serves cached data
- **Cart** persisted to AsyncStorage (survives app kill)
- **Favorites/Wishlist** persisted to AsyncStorage
- **Pending orders** queued in SQLite outbox, synced when back online
- **Background sync** — NetInfo listener flushes outbox on network restoration

### OTA Updates (EAS Update)

After the APK is installed, all UI/logic changes are pushed instantly via:
```bash
npx eas update --branch preview --message "description" --environment preview --platform android --non-interactive
```

No APK rebuild needed for JS changes. Only native module additions (new Expo plugins) require a full EAS build.

---

## What The App Does

### Tab 1: Home — Cultural Heritage Centre

- **Hero Carousel** — Full-height swipeable image slider with 6 slides from all 4 divisions. Auto-scrolls every 5 seconds, dot indicators, gradient overlays, CTA buttons. Slides manageable from WordPress admin ("App Sliders" menu).
- **Logo Bar** — Centered Cultural Heritage logo with tagline
- **Three Division Sections** — Each division (Market, Vault, Gallery) shows:
  - Banner card with hero image and "Shop Now" CTA
  - 2 randomized product cards (different products each load)
  - "View Collection" link to navigate to full product tab
- **Heritage Stories** — Blog posts from the Hub API with featured images
- **YouTube Video Cards** — Two video cards placed between blog posts (tap thumbnail to play inline)
- **Traveler Reviews** — 5 curated reviews with star ratings, avatars, Google/TripAdvisor badges, horizontal scroll cards
- **Quick Links** — About, Our Legacy, Plan Your Visit, Contact
- **Contact Bar** — Address, hours, Call/WhatsApp/Directions buttons

### Tab 2: Market — Handcrafts & Artifacts

- **Hero Carousel** — 3 slides featuring Market images (market-hero, carousel-image04, african-coffee)
- **Title Bar** — "THE MARKET" label with basket icon
- **Category Filter Chips** — Horizontal scroll, rounded pill style (Handcrafts, Masks, Textiles, Spices, Artifacts, Jewelry)
- **Products in Groups of 4** — 2-column grid with breaker banners between groups:
  - "Authentic African Craftsmanship"
  - "Ethically Sourced"
  - "Worldwide Shipping"
- **YouTube Video** — Inserted after 8 products
- **Load More Button** — Loads next page of products
- **Bottom Banner** — "Custom Orders Welcome" with WhatsApp CTA
- Warm earthy design: cream `#FFF8F0` background, terracotta `#D4813B` accents

### Tab 3: Vault — Tanzanite & Fine Jewelry

- **Hero Carousel** — 3 luxury slides (tanzanite, design-jewellery, gems-beads)
- **"Book Private Consultation" CTA** — Opens popup form (name, email, date, interest, budget)
- **Dark Luxury Product Cards** — Near-black `#12121F` cards with gold accents, stone type + carat weight subtitles
- **Breaker Banner** — "Certified & Ethically Sourced" with shield icon
- **YouTube Video** — "The Art of Tanzanite"
- **Load More Button**
- **Bottom Banner** — "Private Viewings Available" with WhatsApp CTA
- **Consultation Form Modal** — Popup form submits via email
- Luxury dark theme: `#0A0A14` background, gold `#C9A962` accents, tanzanite blue `#1E2F97`

### Tab 4: Gallery — Art & Exhibitions

- **Gallery Header** — Charcoal background with gold accent line
- **Exhibitions grouped by status** — "Now Showing", "Upcoming", "Past" with status badges
- **Featured Artworks** — Product grid with artist attribution
- **Gallery Journal** — Blog posts from Gallery site
- **Visit CTA** — "Book Exhibition Visit" button (opens booking form popup), Get Directions, Call
- **Booking Form Modal** — Date, guests, exhibition selection, notes
- Clean museum white: `#FAFAF8` background, charcoal `#1A1A1A` header

### Tab 5: Favorites — Wishlist

- **Persistent favorites** — Hearts on product cards toggle wishlist items
- **Favorite cards** — Image, name, price, site badge
- **Actions** — Add to Cart / Remove per item
- **Badge count** on tab icon
- Empty state with heart icon

### Tab 6: More — Settings & Information

- **Status** — Online/offline indicator, pending sync count
- **Discover** — About Us, Our Legacy, Heritage Journal, Plan Your Visit, Contact Us, Newsletter, WhatsApp
- **Knowledge** — Tanzanite Guide, About the Gallery, About the Market
- **Legal** — Privacy Policy, Terms & Conditions
- **Admin Panel** — Hidden (5 taps on version): environment switching, WC credentials
- White/parchment text on heritage green background

### Product Detail Screen

- **Image Carousel** — Swipeable with dot indicators
- **Quantity Selector** — (- 1 +) with sticky bottom bar
- **Add to Cart** — "Add to Cart — $XX.XX" with running total
- **Favorites Toggle** — Heart icon
- **Product Attributes** — Table display (stone, carat, artist, etc.)
- **Description** — Full product description
- **WhatsApp Enquiry** — Green card with "Chat with us" CTA
- **Share Button** — Native share sheet

### Cart & Checkout

- Items grouped by site (Market, Vault, Gallery) with colored borders
- Quantity +/- and remove per item
- Customer details form (name, email, phone)
- Order summary with subtotal
- **WhatsApp Checkout** — Builds pre-filled message with all items, sends to +255 786 454 999
- **Offline Queue** — Orders saved to SQLite outbox when offline, synced later
- Order also pushed to WordPress via REST API

### Content Pages

- **About Us** — Hero image, divisions list with icons, WordPress page content, contact CTA
- **Our Legacy** — Animated timeline (1994-2024), 8 milestones with staggered reveals, impact stats (30+ years, 2000+ artisans, 100K+ visitors)
- **Contact** — Location card, action buttons (Call, WhatsApp, Email, Website), divisions list, contact form popup
- **Plan Your Visit** — Directions, hours, WordPress page content
- **Blog** — Consolidated posts from all 4 sites with site badges, sorted by date
- All content pages show the AppHeader ribbon and bottom tab bar

### Popup Forms (5 Types)

| Form | Trigger | Fields |
|------|---------|--------|
| Booking | Gallery "Book Exhibition Visit" | Name, email, phone, date, guests, exhibition, notes |
| Consultation | Vault "Book Private Consultation" | Name, email, phone, date, interest, budget, details |
| Contact | Contact "Send Us a Message" | Name, email, phone, subject, message |
| Visit | Plan Your Visit | Name, email, phone, date, visitors, interests, requests |
| Enquiry | General | Name, email, phone, message |

All forms submit via PHP `mail()` to `twinfusion2023@gmail.com`. If email fails, falls back to WhatsApp with pre-filled data.

---

## Design System

### Typography

| Style | Font | Size | Usage |
|-------|------|------|-------|
| Hero Title | Cormorant Garamond Bold | 32px | Carousel slides, hero sections |
| H1 | Cormorant Garamond | 33px | Section headings |
| H2 | Cormorant Garamond | 25px | Card titles, page titles |
| H3 | Cormorant Garamond | 21px | Subtitles |
| Body | Montserrat | 16px | Main text |
| Body Small | Montserrat | 14px | Secondary text |
| Label | Montserrat SemiBold | 11px | Eyebrows, uppercase |
| Button | Montserrat SemiBold | 13px | CTAs, uppercase |
| Price | Montserrat SemiBold | 17px | Product prices |

### Color Palettes

| Site | Primary | Accent | Background |
|------|---------|--------|-----------|
| Hub | `#0e382c` (heritage green) | `#C5A059` (gold) | `#F5F2ED` (parchment) |
| Market | `#3D2B1F` (warm brown) | `#D4813B` (terracotta) | `#FFF8F0` (warm cream) |
| Vault | `#0A0A14` (obsidian) | `#C9A962` (rich gold) | `#0A0A14` (dark) |
| Gallery | `#1A1A1A` (charcoal) | `#C5A059` (gold) | `#FAFAF8` (gallery white) |

### Icons

All icons use `@expo/vector-icons` Ionicons — native vector rendering, no emoji.

### Animations

- **FadeIn** — Fade + slide up entrance (configurable delay, duration, distance)
- **ScaleIn** — Scale + fade with spring physics
- **StaggerList** — Cascading entrance for lists
- **ProductCard** — Random stagger delay for natural cascade effect
- **BlogCard / ExhibitionCard** — Fade + slide/scale on mount
- Built with React Native `Animated` API (works via OTA)

---

## WordPress Admin Features

### App Slider Manager

WordPress mu-plugin at `wp-content/mu-plugins/ch-app-sliders.php`.

**Location:** WordPress Admin > App Sliders (left sidebar menu)

**Features:**
- Add/edit/remove hero carousel slides
- Set image URL, title, subtitle, label, label color, CTA text
- Choose which app tab each slide navigates to
- Preview slide images inline
- Reset to default theme images
- Changes appear in app within 30 seconds

### Content Management

All app content is managed through standard WordPress:
- **Products** — WooCommerce product editor (all 3 shop sites)
- **Blog Posts** — Standard WordPress post editor (all 4 sites)
- **Pages** — WordPress page editor (About, Visit, Newsletter, etc.)
- **Exhibitions** — Custom post type `ch_exhibition` with start/end date meta fields
- **Images** — WordPress Media Library (multisite uploads with `/sites/{blog_id}/` paths)

---

## State Management

| Store | Technology | Persistence | Purpose |
|-------|-----------|-------------|---------|
| `envStore` | Zustand + AsyncStorage | Survives restart | Active environment, API URLs, WC credentials |
| `cartStore` | Zustand + AsyncStorage | Survives restart | Cart items across all 3 shops |
| `favoritesStore` | Zustand + AsyncStorage | Survives restart | Wishlist items |
| `uiStore` | Zustand (memory) | Session only | Online/offline status, sync count |

---

## Build & Deployment

### EAS Build Profiles

| Profile | Output | Channel | Use Case |
|---------|--------|---------|----------|
| `preview` | APK | `preview` | Direct install + OTA updates for testing |
| `production` | AAB | `production` | Google Play Store submission |

### Deployment Flow

1. **Code changes** → `git commit && git push`
2. **OTA push** → `npx eas update --branch preview --platform android`
3. **User restarts app** → Update downloads and applies automatically
4. **Native changes** (new plugins) → Full `npx eas build --profile preview`
5. **PHP API changes** → `node deploy-api.js` (SFTP to production)
6. **WP Plugin changes** → `node deploy-theme.js` or manual SFTP

### Repositories

- **Mobile App:** https://github.com/twinfusion-ke/cultural-heritage-app
- **WordPress:** https://github.com/twinfusion-ke/cultural-heritage-arusha

---

## Project Structure

```
cultural-heritage-app/
├── App.tsx                              # Root: ErrorBoundary, QueryClient, SafeArea, AppInitializer
├── api/
│   ├── index.php                       # Custom PHP API (deployed to production)
│   ├── seed.php                        # Database seeder (products, posts, images)
│   └── seed-pages.php                  # Page content seeder
├── deploy-api.js                       # SFTP deploy script for PHP API
├── src/
│   ├── api/
│   │   ├── appApi.ts                   # Unified API client (single endpoint, cache-busting)
│   │   ├── hub.ts                      # Hub posts/pages hooks with offline caching
│   │   ├── market.ts                   # Market products/categories hooks
│   │   ├── jewelry.ts                  # Jewelry products hooks
│   │   ├── gallery.ts                  # Gallery exhibitions/products hooks
│   │   └── types.ts                    # AppProduct, AppCategory, AppExhibition, AppSearchResult
│   ├── components/
│   │   ├── AppHeader.tsx               # Branded header: logo, search, WhatsApp, cart (Ionicons)
│   │   ├── HeroCarousel.tsx            # Full-screen auto-scrolling image slider
│   │   ├── YouTubeCard.tsx             # Inline YouTube player with thumbnail + play button
│   │   ├── ReviewsSection.tsx          # Traveler reviews with horizontal scroll cards
│   │   ├── FormModal.tsx               # Reusable popup form (5 types, email submission)
│   │   ├── ProductCard.tsx             # Animated product grid card
│   │   ├── BlogCard.tsx                # Animated blog post card
│   │   ├── ExhibitionCard.tsx          # Animated exhibition card with status badge
│   │   ├── ProductQuickView.tsx        # Bottom sheet product detail modal
│   │   ├── VideoHero.tsx               # YouTube video background component
│   │   ├── ScreenContainer.tsx         # Standard screen wrapper
│   │   ├── Button.tsx                  # Multi-variant button (primary/outline/ghost)
│   │   ├── Divider.tsx                 # Gold accent line
│   │   ├── ExhibitionBadge.tsx         # Now Showing / Upcoming / Past badge
│   │   ├── HtmlRenderer.tsx            # Cross-platform HTML renderer (WebView/iframe)
│   │   ├── NetworkError.tsx            # Error state with retry button
│   │   └── animated/
│   │       ├── FadeIn.tsx              # Fade + slide up entrance
│   │       ├── ScaleIn.tsx             # Scale + fade spring entrance
│   │       └── StaggerList.tsx         # Cascading entrance for lists
│   ├── config/
│   │   └── environment.ts             # Production/staging environments, API URL derivation
│   ├── db/
│   │   ├── database.ts                # SQLite init (WAL mode)
│   │   ├── schema.ts                  # Tables: content_cache, outbox, telemetry, users_local
│   │   ├── contentCache.ts            # SQLite cache CRUD with TTL
│   │   └── outbox.ts                  # Offline mutation queue CRUD
│   ├── hooks/
│   │   └── useNetworkStatus.ts        # NetInfo monitoring
│   ├── navigation/
│   │   └── TabNavigator.tsx           # 6-tab bottom nav with nested stacks (tab bar on all screens)
│   ├── screens/
│   │   ├── home/HomeScreen.tsx        # Hero carousel, divisions, blogs, videos, reviews
│   │   ├── market/MarketScreen.tsx    # Hero slider, product groups, video, banner
│   │   ├── vault/VaultScreen.tsx      # Luxury dark, hero slider, consultation form
│   │   ├── gallery/GalleryScreen.tsx  # Museum white, exhibitions, booking form
│   │   ├── favorites/FavoritesScreen.tsx # Wishlist cards
│   │   ├── more/MoreScreen.tsx        # Settings, links, admin panel
│   │   ├── cart/CartScreen.tsx        # Unified cart, WhatsApp checkout
│   │   ├── product/ProductDetailScreen.tsx # Image carousel, sticky cart bar
│   │   ├── search/SearchScreen.tsx    # Global search across all sites
│   │   ├── blog/BlogScreen.tsx        # Consolidated blog from all 4 sites
│   │   ├── about/AboutScreen.tsx      # Hero, divisions, content, CTA
│   │   ├── contact/ContactScreen.tsx  # Location, actions, contact form
│   │   ├── legacy/LegacyScreen.tsx    # Animated timeline 1994-2024
│   │   └── content/
│   │       ├── ContentScreen.tsx      # WordPress page renderer
│   │       ├── PostDetailScreen.tsx   # Blog post detail
│   │       └── ExhibitionDetailScreen.tsx # Exhibition detail
│   ├── services/
│   │   ├── syncService.ts            # Background outbox sync
│   │   └── telemetry.ts              # Usage tracking
│   ├── stores/
│   │   ├── cartStore.ts              # Zustand cart (AsyncStorage)
│   │   ├── envStore.ts               # Zustand environment (AsyncStorage)
│   │   ├── favoritesStore.ts         # Zustand wishlist (AsyncStorage)
│   │   └── uiStore.ts               # Zustand UI state (memory)
│   ├── theme/
│   │   ├── colors.ts                 # Brand colors for 4 divisions
│   │   ├── typography.ts            # Cormorant Garamond + Montserrat
│   │   ├── spacing.ts               # Spacing scale, shadows
│   │   ├── theme.ts                 # Division themes, route mapping
│   │   └── index.ts                 # Barrel export
│   ├── types/
│   │   ├── wordpress.ts             # WPPost, WPPage, WPMedia types
│   │   ├── woocommerce.ts           # WCProduct, WCOrder types
│   │   └── exhibition.ts           # Exhibition CPT types
│   └── utils/
│       └── dates.ts                 # Exhibition status, date formatting
```

---

## Contact

**Cultural Heritage Centre**
Dodoma Road, Arusha, Tanzania
Phone: +255 786 454 999
Email: twinfusion2023@gmail.com
WhatsApp: wa.me/255786454999

*App developed March 2026 by Twinfusion*
