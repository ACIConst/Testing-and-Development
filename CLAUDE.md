# CLAUDE.md — Champ's Butcher Shop Kiosk & Admin

## Project overview
Kiosk ordering system for Champ's Butcher Shop (Halstead, KS). Customers browse a menu, add items to cart, and place orders. Staff manage everything through an admin panel. Built with React 19 + Vite + Firebase (Firestore, Auth, Storage).

## Tech stack
- **Frontend**: React 19, Vite 6, React Router 7, inline styles (no CSS modules/Tailwind in components)
- **Backend**: Firebase — Firestore (database), Firebase Auth (admin login), Firebase Storage (images, logos)
- **Styling**: Design tokens in `src/styles/tokens.js` (`C` = dark colors, `CLight` = light colors, `F` = fonts). All styles are inline. No CSS files for components.
- **Theming**: `AdminThemeContext` provides themed colors via the "shadow import" pattern — each admin component does `const {T:C, TF:F} = useAdminTheme()` to shadow the file-level `C`/`F` imports with themed values.

## Architecture

### Routes
- `/` — Landing page (public)
- `/kiosk` — Customer kiosk (public browse, auth at checkout via kioskUsers)
- `/admin` — Admin panel (Firebase Auth via OperatorGate, then kioskUsers role check)

### Auth flow
- **Kiosk customers**: Browse freely, authenticate at checkout against `kioskUsers` collection (FNV-1a hash)
- **Admin panel**: Firebase Auth sign-in (OperatorGate) → role check against `kioskUsers` (must be "Super Admin" or "manager") → admin panel. Two security layers.
- **Staff accounts**: `kioskAdmins` collection stores admin panel credentials (separate from kiosk customers)

### Key collections (Firestore)
- `kioskMenu` — Menu items (public read)
- `kioskCategories` — Categories with sortOrder (public read)
- `kioskOrders` — Orders with 7-step status lifecycle (public create)
- `kioskUsers` — Customer accounts (public create for self-registration)
- `kioskAdmins` — Staff accounts for admin panel login
- `kioskConfig` — App config: orderCounter, branding (logo), storeInfo
- `inventoryAdjustments` — Stock change audit trail
- `auditLogs` — All CRUD audit logs

### Order status lifecycle
`placed` → `paid` → `picking` → `out_for_delivery` → `delivered`
- `cancelled` is a separate terminal status (not archived, stays visible)
- Archived orders have `archived: true`

## File structure
- `src/views/admin/AdminView.jsx` — Monolithic admin panel (~900 lines). All tabs are components within this file.
- `src/views/kiosk/KioskView.jsx` — Customer-facing kiosk
- `src/components/ui.jsx` — Shared UI components (Modal, Btn, Field, inputSt, smallBtn). Accept optional `t` theme param for admin theming.
- `src/styles/tokens.js` — Design tokens: `C` (dark), `CLight` (light), `F` (fonts), `FONT_OPTIONS`, order statuses, delivery locations, seed data
- `src/context/AdminThemeContext.jsx` — Theme/font/logo state, persists to localStorage + Firestore
- `src/context/AuthContext.jsx` — Firebase Auth state
- `src/hooks/useFirestore.js` — Firestore hooks (useMenu, useUsers, useOrders, etc.) and DB operations facade
- `src/lib/api/` — Audit-logged API layer (orders, menu, users, categories, inventory, orderIds)
- `src/config/firebase.js` — Firebase initialization from env vars

## Conventions
- **Inline styles only** in components — no CSS classes except utility classes in global styles
- **ui.jsx components** are shared between kiosk and admin — pass `t={C}` for themed admin usage
- **Seeds are dev-only** — gated behind `import.meta.env.DEV`, tree-shaken from production builds
- **API layer** wraps Firestore calls with try-catch and writes audit logs. Errors propagate to callers (which show toasts). Audit log failures are non-critical (swallowed with console.warn).
- **Password hashing**: FNV-1a with `_champs_bk` suffix (non-cryptographic, sufficient for kiosk PINs)

## Environment variables
All in `.env.local` (gitignored). See `.env.example` for required keys:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_DEFAULT_ADMIN_PW          # dev-only: seed admin password
```

## Admin panel sidebar
Dashboard, Menu Items, Categories, Customers, Orders, Delivery, Inventory History, Audit Log, Settings

## Settings page tabs
- **Appearance** — Dark/light theme, font selector, logo upload
- **Staff & Access** — Manage admin panel staff accounts (roles: Employee, Manager, Admin, Super Admin)
- **Store Info** — Store name, address, phone, hours (saved to kioskConfig/storeInfo)
- **Notifications** — Order chime on/off, volume control

## Security rules
- `firestore.rules` — Kiosk data is public-read, orders public-create. Admin writes require `isManager()` role.
- `storage.rules` — Production rules: menu/barcode images public-read, writes require auth. Everything else denied.
- Never set `allow: true` without justification in rules files.

## Common commands
```bash
npm run dev          # Start dev server (Vite)
npx vite build       # Production build
firebase deploy      # Deploy rules + hosting
```

## Things to watch for
- `AdminView.jsx` is monolithic — all admin tabs are in one file. Consider splitting if it grows beyond ~1000 lines.
- The "shadow import" pattern (`const {T:C} = useAdminTheme()`) is critical for theming — every admin component must include it or colors won't adapt to light mode.
- `kioskUsers` serves dual purpose: customer accounts AND admin role authorization. The `role` field determines admin access.
- Order notification chime reads from localStorage (`admin-chime`, `admin-volume`), not React state.
