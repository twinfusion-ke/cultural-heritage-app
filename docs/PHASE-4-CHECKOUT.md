# Phase 4: Business Logic & Checkout

**Date:** March 15, 2026

---

## 1. Cart System

### Cart Store (Zustand + MMKV)
- Unified cart across Market, Vault, and Gallery
- Items persisted to MMKV — survives app kill
- Each item tracks: productId, name, price, quantity, imageUrl, site, attributes
- Methods: addItem, removeItem, updateQuantity, clearCart, clearSiteCart, getTotal, getItemCount, getSiteItems

### Cart Screen
- Items grouped by site (The Market, The Vault, Art Gallery) with colored left border
- Quantity controls (−/+) with remove button
- Customer details form (name*, email, phone)
- Order summary (subtotal, shipping note, total)
- Sticky checkout button at bottom

## 2. WhatsApp Checkout Flow

```
User adds items → Cart Screen → Enters name → Taps checkout
                                                    ↓
                              ┌─── Online ─────────────────────┐
                              │ 1. Queue order in SQLite outbox │
                              │ 2. Open WhatsApp deep-link      │
                              │ 3. Clear cart                   │
                              │ 4. Go back to shop              │
                              └─────────────────────────────────┘
                              ┌─── Offline ────────────────────┐
                              │ 1. Queue order in SQLite outbox │
                              │ 2. Show "Order Queued" alert    │
                              │ 3. Clear cart                   │
                              │ 4. SyncService pushes on reconnect │
                              └─────────────────────────────────┘
```

### WhatsApp Message Format
```
Hello! I would like to order from Cultural Heritage:

Name: John Doe
Email: john@example.com
Phone: +255786000000

--- The Market ---
• Makonde Sculpture x1 ($250.00)
• Kanga Textile x2 ($90.00)

--- The Vault ---
• Tanzanite Ring x1 ($4,500.00)

Total: $4,840.00

Sent from Cultural Heritage App
```

### Order Payload (Queued in Outbox)
```json
{
  "payment_method": "whatsapp",
  "payment_method_title": "WhatsApp Order",
  "status": "on-hold",
  "billing": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+255786000000"
  },
  "line_items": [
    { "product_id": 123, "quantity": 1 }
  ],
  "meta_data": [
    { "key": "_ch_pos_order", "value": "true" },
    { "key": "_ch_pos_terminal_id", "value": "MOBILE_APP" }
  ]
}
```

## 3. Navigation Updates

- Added `createNativeStackNavigator` for root navigation
- Cart opens as modal (slide from bottom)
- Cart badge on tab bar (Market, Vault, Gallery tabs)
- CartButton component for screen headers

## 4. Offline Checkout

When offline:
1. Order is saved in SQLite outbox with `sync_status: 'pending'`
2. User sees "Order Queued" alert
3. Cart is cleared
4. SyncService detects network → flushes outbox → creates WC order via REST API
5. Pending count decrements in More tab

## 5. Reuse Guide

The checkout flow works with any WooCommerce backend:
1. Change `WHATSAPP_NUMBER` in CartScreen.tsx
2. Outbox automatically targets the correct site's WC API
3. Order payload follows standard WC REST API format
