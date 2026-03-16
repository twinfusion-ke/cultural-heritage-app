# Cultural Heritage Centre — Mobile App

## App Overview

**Cultural Heritage** is a native Android (and future iOS) mobile application for the Cultural Heritage Centre in Arusha, Tanzania — one of East Africa's most distinguished cultural destinations, operating since 1994.

The app serves as a unified mobile storefront and information hub for the Centre's four distinct divisions: the main institutional hub, The Market (handcrafts & artifacts), The Vault (tanzanite & fine jewelry), and The Art Gallery (contemporary & traditional fine art with rotating exhibitions).

**Package:** `com.twinfusion.culturalheritage`
**Platform:** Android 14+ (iOS planned)
**Framework:** React Native + Expo (TypeScript)
**Backend:** WordPress Multisite REST API (live production at twinfusion.co.ke)

---

## What The App Does

### Tab 1: Home — Cultural Heritage Centre

The home screen presents the Cultural Heritage Centre's brand identity with:

- **Hero section** displaying the Centre's logo over the actual hero image from the production website
- **Three Pillars** — tappable cards for The Market, The Vault, and The Art Gallery, each using real hero images from the respective website themes. Tapping navigates to the corresponding tab
- **Heritage Stories** — live blog posts fetched from the WordPress Hub REST API (`/wp-json/wp/v2/posts`), displaying titles, excerpts, featured images, and publication dates. Tapping any post opens a full native article view
- **Quick Links** — Our Legacy, Experience, Plan Your Visit, Contact — each opens the actual WordPress page content rendered natively inside the app
- **Contact Bar** — address, hours, and action buttons for Call, WhatsApp, and Google Maps directions

### Tab 2: Market — Handcrafts & Artifacts

The Market tab connects to the WooCommerce REST API at `/cultural-heritage/market/wp-json/wc/v3/`:

- **Category filter chips** — horizontal scrollable list fetched from WooCommerce product categories API. Tap to filter by Handcrafts, Spices & Oils, Textiles, Artifacts, etc.
- **Product grid** — 2-column grid of products with images, names, and prices fetched from the live WooCommerce product catalog
- **Pull-to-refresh** — swipe down to reload latest products from the server
- **WhatsApp enquiry** — tapping a product opens WhatsApp with a pre-filled message containing the product name and price
- **Add to cart** — products can be added to the unified cart (shared across all three shop tabs)
- **Empty state** — when no products are loaded yet, shows a WhatsApp contact button instead

### Tab 3: Vault — Tanzanite & Fine Jewelry

The Vault tab connects to `/cultural-heritage/jewelry/wp-json/wc/v3/`:

- **Luxury hero banner** — "Rare Gemstones & Fine Jewelry" with tanzanite accent styling
- **Product grid** — each product card shows stone type and carat weight as subtitles (extracted from WooCommerce product attributes)
- **WhatsApp enquiry** — sends full attribute details (stone, carat, cut, setting) in the WhatsApp message
- **Book Private Consultation** — sticky CTA bar at the bottom linking to WhatsApp for appointment booking
- **Empty state** — consultation booking and WhatsApp contact when no products are loaded

### Tab 4: Gallery — Art & Exhibitions

The Gallery tab connects to two endpoints:
- Exhibitions: `/cultural-heritage/gallery/wp-json/wp/v2/ch_exhibition`
- Art products: `/cultural-heritage/gallery/wp-json/wc/v3/products`
- Blog: `/cultural-heritage/gallery/wp-json/wp/v2/posts`

Features:
- **Exhibitions grouped by status** — "Now Showing" (full cards), "Upcoming" (horizontal scroll), and "Past" — status calculated dynamically by comparing today's date against `_ch_exhibition_start_date` and `_ch_exhibition_end_date` meta fields
- **Exhibition status badges** — green dot for Now Showing, amber for Upcoming, grey for Past
- **Exhibition detail screen** — tapping an exhibition opens a full native view with hero image, status badge, date range, full curatorial content, exhibition details sidebar (location, hours, admission), share buttons, and direction/call CTAs
- **Featured Artworks** — product grid with artist attribution from WooCommerce attributes
- **Gallery Journal** — blog posts from the Gallery site
- **Visit CTA** — directions and call buttons

### Tab 5: More — Settings & Information

The More tab provides:
- **Online/offline status** — green dot (connected) or red dot (offline) with descriptive text
- **Pending sync count** — shows number of queued operations waiting to sync, with manual sync button
- **Cart count** — shows items currently in cart
- **Discover section** — About Cultural Heritage, Our Legacy, Plan Your Visit, Contact Us, WhatsApp — each opens actual WordPress page content rendered natively
- **Knowledge section** — Tanzanite Guide, Collecting Art Guide, Gemstone Certification, Jewelry Care — content from the Jewelry and Gallery sub-sites
- **Legal section** — Privacy Policy, Terms & Conditions, Shipping Policy — real content from WordPress
- **App section** — Notifications, Language, Currency settings (placeholders for future implementation)
- **Hidden admin panel** — 5 taps on the version number reveals server settings: environment switching (Production/Staging), WooCommerce consumer key/secret, POS API key. Allows switching the backend domain at runtime without rebuilding the app

---

## Technical Architecture

### Data Flow

```
Production WordPress Database (twinfusion.co.ke)
         ↓
WordPress REST API + WooCommerce REST API
         ↓
TanStack Query (fetch, cache 24h, stale-while-revalidate)
         ↓
React Native Screens (render)
         ↓
User Action (add to cart, enquire, browse)
         ↓
Zustand Cart Store (AsyncStorage persistence)
  OR WhatsApp deep-link (Linking.openURL)
  OR SQLite Outbox (deferred sync when offline)
```

### API Connections (4 Sub-Sites)

| Site | REST Base | WooCommerce Base |
|------|-----------|-----------------|
| Hub | `/cultural-heritage/wp-json/wp/v2/` | — |
| Market | `/cultural-heritage/market/wp-json/wp/v2/` | `/cultural-heritage/market/wp-json/wc/v3/` |
| Jewelry | `/cultural-heritage/jewelry/wp-json/wp/v2/` | `/cultural-heritage/jewelry/wp-json/wc/v3/` |
| Gallery | `/cultural-heritage/gallery/wp-json/wp/v2/` | `/cultural-heritage/gallery/wp-json/wc/v3/` |

All URLs derive from a single `BASE_DOMAIN` constant, changeable at runtime via the admin panel.

### Offline-First Design

- **Product/post data** cached by TanStack Query (24h TTL, stale-while-revalidate)
- **Cart** persisted to AsyncStorage (survives app kill)
- **Pending orders** queued in SQLite outbox table with `sync_status: pending`
- **Background sync** — NetInfo listener detects network restoration and flushes outbox in chronological order
- **Offline checkout** — orders are queued locally and synced when back online; user sees "Order Queued" confirmation

### Cart & Checkout

The cart is unified across Market, Vault, and Gallery — items from all three shops appear in one cart, grouped by site.

**Checkout flow:**
1. User adds items from any shop tab
2. Opens Cart screen (modal slide from bottom)
3. Enters name (required), email, phone (optional)
4. Taps "Complete via WhatsApp" (online) or "Queue Order (Offline)"
5. Order payload is saved to SQLite outbox
6. If online: WhatsApp opens with pre-filled message listing all items, quantities, prices, and total
7. If offline: order queued, synced later via REST API

**WhatsApp message format:**
```
Hello! I would like to order from Cultural Heritage:

Name: [Customer Name]
Email: [Email]
Phone: [Phone]

--- The Market ---
• Makonde Sculpture x1 ($250.00)

--- The Vault ---
• Tanzanite Ring x1 ($4,500.00)

Total: $4,750.00

Sent from Cultural Heritage App
```

### Content Pages

The More tab's menu items open a `ContentScreen` that:
1. Fetches the page by slug from the appropriate site's REST API
2. Renders the WordPress page HTML content inside a styled WebView
3. Uses branded typography (Cormorant Garamond headings, Montserrat body)
4. Handles images, lists, blockquotes, tables, links within the content

### Error Handling

- **Error Boundary** wraps the entire app — any crash shows a recovery screen instead of killing the app
- **Font loading timeout** — if fonts don't load within 3 seconds, app proceeds with system fonts
- **Network errors** are caught by Axios interceptor and marked as network errors for the sync queue
- **API failures** retry once with exponential backoff

---

## Design System

### Typography

| Style | Font | Size | Usage |
|-------|------|------|-------|
| Hero Title | Cormorant Garamond | 48px | Home hero |
| H1 | Cormorant Garamond | 32px | Section headings |
| H2 | Cormorant Garamond | 24px | Card titles |
| H3 | Cormorant Garamond | 20px | Subtitles |
| Body | Montserrat | 15px | Main text |
| Label | Montserrat SemiBold | 10px | Eyebrows, uppercase |
| Button | Montserrat SemiBold | 12px | CTAs, uppercase |
| Price | Montserrat SemiBold | 16px | Product prices |

### Color Palettes

| Site | Primary | Accent | Background |
|------|---------|--------|-----------|
| Hub | `#0e382c` (heritage green) | `#C5A059` (gold) | `#F5F2ED` (parchment) |
| Market | `#3D2B1F` (warm brown) | `#D4813B` (terracotta) | `#FFF8F0` (warm cream) |
| Vault | `#0A0A14` (obsidian) | `#C9A962` (rich gold) | `#FAFAFA` (stark white) |
| Gallery | `#1A1A1A` (charcoal) | `#C5A059` (gold) | `#FAFAF8` (gallery white) |

### App Header

Every screen displays a branded header with:
- Cultural Heritage logo (fetched from production: `logo-white.png`)
- WhatsApp button (opens WhatsApp to +255 786 454 999)
- Cart button with badge count (opens Cart modal)
- Offline indicator (red dot when disconnected)

### App Icon & Splash

- **App Icon:** Cultural Heritage logo (white) on heritage green (`#0e382c`) background, 1024x1024px
- **Android Adaptive Icon:** logo foreground on green background, monochrome variant
- **Splash Screen:** Heritage green background with centered white logo

---

## Reusable Components

| Component | Purpose |
|-----------|---------|
| `AppHeader` | Branded header with logo, cart, WhatsApp, offline indicator |
| `ScreenContainer` | Standard screen wrapper with SafeArea, scroll, pull-to-refresh |
| `Button` | CTA button (primary/outline/ghost, sm/md/lg, any accent color) |
| `ProductCard` | Product grid item (image, name, price, site-specific accent) |
| `ExhibitionBadge` | Dynamic status dot (Now Showing/Upcoming/Past) |
| `ExhibitionCard` | Exhibition list item (image, dates, title, status badge) |
| `BlogCard` | Blog post card (image, category, title, excerpt, date) |
| `Divider` | Gold accent line separator |
| `CartButton` | Floating cart icon with badge count |

---

## State Management

| Store | Technology | Persistence | Purpose |
|-------|-----------|-------------|---------|
| `envStore` | Zustand + AsyncStorage | Survives restart | Active environment, API URLs, WC credentials |
| `cartStore` | Zustand + AsyncStorage | Survives restart | Cart items across all 3 shops |
| `uiStore` | Zustand (memory) | Session only | Online/offline status, sync count |

---

## Build & Deployment

### EAS Build Profiles

| Profile | Output | Use Case |
|---------|--------|----------|
| `preview` | APK | Direct install on Android devices for testing |
| `production` | AAB | Google Play Store submission |

### CI/CD

- **GitHub Actions** workflow triggers EAS build on push to master
- **WordPress deploy** workflow pushes themes/mu-plugins to cPanel via SSH

### Repositories

- **Mobile App:** https://github.com/twinfusion-ke/cultural-heritage-app
- **WordPress:** https://github.com/twinfusion-ke/cultural-heritage-arusha

---

## Future Features (Planned)

1. **User Authentication** — WordPress login, session persistence until logout/restart
2. **Push Notifications** — Firebase Cloud Messaging for orders, comments, new products
3. **Subscription Alerts** — customers subscribe to specific sites (Market/Vault/Gallery) for new product notifications
4. **Error Reporting** — crash logs emailed to twinfusion2023@gmail.com via Sentry
5. **Usage Telemetry** — session tracking synced to WordPress
6. **POS Integration** — barcode scanner for in-store purchases via Gallery POS API
7. **Multi-Currency** — TZS, USD, EUR switching
8. **Deep-Zoom** — pinch-to-zoom on jewelry product images using Reanimated 3
9. **iOS Build** — Apple App Store submission via EAS

---

## Contact

**Cultural Heritage Centre**
Dodoma Road, Arusha, Tanzania
Phone: +255 786 454 999
Email: twinfusion2023@gmail.com
WhatsApp: wa.me/255786454999

*App developed March 2026*
