# Phase 1: Project Initialization & Architecture

**Date:** March 15, 2026
**Framework:** React Native + Expo (Managed Workflow)
**Language:** TypeScript (Strict Mode)

---

## 1. Project Creation

```bash
npx create-expo-app@latest cultural-heritage-app --template blank-typescript
cd cultural-heritage-app
```

## 2. Dependencies Installed

### Core Navigation
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

### Data Layer
```bash
npm install @tanstack/react-query    # Server state + offline cache
npm install zustand                   # Client state (cart, UI, env)
npm install axios                     # HTTP client for WP REST API
npm install react-native-mmkv         # Fast key-value persistence (env config, tokens)
npm install expo-sqlite               # Local SQLite DB (outbox, telemetry, offline auth)
```

### Networking
```bash
npm install @react-native-community/netinfo  # Online/offline detection
```

### UI & Media
```bash
npm install expo-image          # Cached image loading (disk cache for products)
npm install expo-font           # Custom fonts (Cormorant Garamond, Montserrat)
npm install expo-splash-screen  # Splash screen control
npm install expo-linking        # WhatsApp deep links
npm install expo-constants      # App version, env info
npm install expo-status-bar     # Status bar styling
```

## 3. Project Structure

```
cultural-heritage-app/
├── docs/                    # Process documentation (reusable across projects)
│   ├── PHASE-1-SETUP.md    # This file
│   ├── PHASE-2-DESIGN.md   # Design system docs
│   └── ...
├── src/
│   ├── api/                 # Axios instances per WP sub-site
│   │   ├── client.ts        # Base API client factory
│   │   ├── hub.ts           # Main Hub endpoints
│   │   ├── market.ts        # Market WC endpoints
│   │   ├── jewelry.ts       # Jewelry WC endpoints
│   │   └── gallery.ts       # Gallery WC + Exhibition endpoints
│   ├── config/
│   │   └── environment.ts   # Domain config, env switching
│   ├── db/
│   │   ├── schema.ts        # SQLite table definitions
│   │   ├── database.ts      # DB init + migrations
│   │   └── outbox.ts        # Outbox pattern CRUD
│   ├── hooks/
│   │   ├── useNetworkStatus.ts  # NetInfo hook
│   │   └── useSync.ts          # Sync queue hook
│   ├── navigation/
│   │   └── TabNavigator.tsx # 5-tab bottom navigation
│   ├── screens/
│   │   ├── home/            # Tab 1: Cultural Heritage hub
│   │   ├── market/          # Tab 2: Handcrafts shop
│   │   ├── vault/           # Tab 3: Jewelry shop
│   │   ├── gallery/         # Tab 4: Art + Exhibitions
│   │   └── more/            # Tab 5: Settings, legal, profile
│   ├── components/          # Shared UI components
│   ├── stores/
│   │   ├── cartStore.ts     # Zustand cart (persisted MMKV)
│   │   ├── envStore.ts      # Zustand environment config
│   │   └── uiStore.ts       # UI state (offline banner, etc.)
│   ├── services/
│   │   ├── syncService.ts   # Background sync (outbox flush)
│   │   └── telemetry.ts     # Usage logging
│   ├── theme/
│   │   └── colors.ts        # Brand colors per site
│   ├── types/
│   │   ├── wordpress.ts     # WP REST API response types
│   │   ├── woocommerce.ts   # WC product/order types
│   │   └── exhibition.ts    # Exhibition CPT types
│   └── utils/
│       └── dates.ts         # Exhibition status logic
├── app.json                 # Expo config
├── App.tsx                  # Root component
├── tsconfig.json            # TypeScript config
└── package.json
```

## 4. Architecture Decisions

### Offline-First Strategy
| Data Type | Storage | TTL | Sync Strategy |
|-----------|---------|-----|---------------|
| Products, Exhibitions, Posts | TanStack Query + MMKV | 24h | Stale-while-revalidate |
| Cart | Zustand + MMKV | Never expires | Local only |
| Pending Orders | SQLite outbox | Until synced | Push on reconnect (FIFO) |
| User Registration | SQLite | Until synced | Push on reconnect |
| Telemetry | SQLite | Until synced | Batch push every 15min (online) |
| Images | expo-image disk cache | 7 days | Already cached |
| Environment Config | MMKV | Permanent | Manual change only |

### Domain Switching
All API URLs derive from a single `BASE_DOMAIN`:
```
BASE_DOMAIN = "twinfusion.co.ke/cultural-heritage"

Hub API:     https://{BASE_DOMAIN}/wp-json/wp/v2/
Market API:  https://{BASE_DOMAIN}/market/wp-json/wc/v3/
Jewelry API: https://{BASE_DOMAIN}/jewelry/wp-json/wc/v3/
Gallery API: https://{BASE_DOMAIN}/gallery/wp-json/wp/v2/
```

Changeable at runtime via admin settings (no rebuild needed).

### Outbox Pattern (Deferred Sync)
```
SQLite Table: outbox
┌────┬──────────┬─────────┬────────────┬─────────────┬─────────────┬───────────┐
│ id │ type     │ site    │ payload    │ created_at  │ sync_status │ retry_cnt │
├────┼──────────┼─────────┼────────────┼─────────────┼─────────────┼───────────┤
│ 1  │ order    │ market  │ {json}     │ 2026-03-15  │ pending     │ 0         │
│ 2  │ enquiry  │ jewelry │ {json}     │ 2026-03-15  │ pending     │ 0         │
│ 3  │ order    │ gallery │ {json}     │ 2026-03-15  │ synced      │ 0         │
└────┴──────────┴─────────┴────────────┴─────────────┴─────────────┴───────────┘
```

On network restore → flush pending items in chronological order → update status.

## 5. Reuse Guide

This architecture is reusable for any WordPress Multisite + WooCommerce mobile app:
1. Change `BASE_DOMAIN` in `src/config/environment.ts`
2. Adjust sub-site paths in `src/api/client.ts`
3. Update brand colors in `src/theme/colors.ts`
4. Modify SQLite schema in `src/db/schema.ts`
5. Swap tab screens in `src/navigation/TabNavigator.tsx`
