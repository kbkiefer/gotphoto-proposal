# GotPhoto Demo Apps — Design Document

## Purpose

Build two working demo apps for a screen-recorded video proposal to GotPhoto. The apps demonstrate what GotPhoto's platform could become — a modern parent-facing mobile app and a redesigned photographer admin website. All data is mock (Bert's ChoicePix business). No backend, no sync, no dependencies. Pure static HTML/CSS/JS.

## Deliverable

A screen recording Kevin produces showing both apps in action, edited to tell the story of the improved platform.

---

## Project Structure

```
GotPhoto App System Proposal/
├── presentation/          ← existing slide deck
├── admin/                 ← photographer desktop website
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── assets/
├── app/                   ← parent mobile PWA
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── manifest.json
│   ├── sw.js
│   └── assets/
└── data/
    └── mock.js            ← shared mock data
```

---

## Mock Data (data/mock.js)

Based on Bert's ChoicePix / GotPhoto setup:

- **Photographer**: Bert Kiefer, ChoicePix Photography
- **Job**: "Lincoln High Seniors 2026"
- **Access code**: CHOICEPIX-2026
- **Students**: Allanah Mendoza (primary demo subject), plus 3-4 others in lists
- **Packages** (redesigned from the real 34-package flat list):
  - Digital Collection — All Photos: $199
  - Essentials Print Package: $89
  - Premium Print + Digital: $249
  - Canvas Portrait 16x20: $175
  - Framed Collection: $299
  - Wallet & Minis Pack: $45
  - Build Your Own: variable
- **Categories**: Digital, Prints, Canvas & Wall Art, Frames, Build Your Own
- **Photos**: 8-10 placeholder senior portrait images (royalty-free or generated)
- **Analytics**: Revenue $12,450, orders 47, conversion 34%, avg order $265
- **Campaigns**: 2 email campaigns with open/click rates

---

## Client App (Parent Mobile PWA)

### Screens

1. **Access Code Entry**
   - School/photographer logo area
   - "Enter your access code" input
   - Submit button
   - Pre-filled: CHOICEPIX-2026

2. **Gallery (Home)**
   - Student name header: "Allanah Mendoza"
   - Photo grid (2-column masonry or uniform)
   - Tap photo → full-screen viewer with swipe, pinch-to-zoom, heart to favorite
   - Favorited photos counter badge

3. **Package Discovery**
   - Category tabs: Digital | Prints | Canvas | Frames | Build
   - Price filter pills: All | Under $100 | $100-250 | $250+
   - Visual package cards: thumbnail, name, price, brief description
   - "Recommended" badge on Premium Print + Digital
   - Tap card → package detail with included items

4. **Photo Selection**
   - After selecting a package, pick which photos go in it
   - Side-by-side compare mode (two photos)
   - Live preview: selected photo composited into a frame/canvas mockup
   - Confirm selection button

5. **Cart**
   - Visual list: package name, selected photo thumbnail, price
   - Upsell bar: "Add wallet prints for $15"
   - Multi-student: "Add another student" link
   - Subtotal, proceed to checkout

6. **Checkout**
   - One-page layout
   - Order summary with thumbnails
   - Apple Pay button (prominent, non-functional)
   - Card fields (visual only)
   - Gift option toggle
   - "Place Order" button
   - Does not submit — visual only

### Navigation
- Bottom tab bar: Gallery | Packages | Cart | Account
- Cart tab shows badge count
- Smooth slide transitions between screens

### Visual Style
- Light theme: white bg, #f8f9fa surfaces, soft shadows
- Accent color: warm tone matching ChoicePix brand
- Large photos, generous whitespace
- System font stack (Inter/SF Pro feel)
- Rounded corners (12-16px), subtle borders
- Micro-interactions: heart pulse, cart badge bounce, smooth page slides

### PWA
- manifest.json for installability (name, icon, theme color, display: standalone)
- Basic service worker for offline shell
- No browser chrome when installed — looks like a native app

---

## Admin Website (Photographer Desktop)

### Pages

1. **Dashboard**
   - Stat cards: Revenue ($12,450), Orders (47), Active Galleries (3), Conversion (34%)
   - Weekly revenue mini chart (CSS/SVG, no chart library)
   - Recent orders table: student name, package, amount, time
   - Notification bell with unread count

2. **Jobs**
   - Table/card list of jobs
   - "Lincoln High Seniors 2026" — Active, 156 subjects, $12,450 revenue
   - "Roosevelt Elementary Fall 2025" — Archived, 89 subjects
   - Status badges, quick-action buttons

3. **Job Detail** (the money page)
   - Left: Job config form — name, access code, archive date, status toggle
   - Right: Embedded phone-frame preview showing the client app's package view
   - Edit a field on the left → the phone preview updates (JS state toggle, not real sync)
   - "Preview as..." dropdown to switch student context
   - Mobile/desktop preview toggle

4. **Package Manager**
   - Visual card grid of packages for the active job
   - Each card: name, category pill, price, item count
   - Click to expand inline editor: name, category, price, included items as chips
   - "Add Package" button
   - Drag handle on cards for reorder (visual, doesn't need real drag-and-drop)

5. **Analytics**
   - Revenue over time line chart (SVG)
   - Package popularity horizontal bar chart
   - Top-selling packages ranked list
   - Photo selection stats (which poses are most popular)
   - All numbers hardcoded

6. **Campaigns**
   - Campaign list: name, status, open rate, click rate
   - Email preview mockup
   - "AI Suggested Subject Lines" shown as selectable pills
   - SMS toggle

### Layout
- Dark sidebar (240px): nav items with icons, photographer name/avatar at top
- Light content area
- Top bar: page title, search, notification bell, profile

### Visual Style
- Sidebar: #1a1a2e or similar dark
- Content: white/#fafafa
- Accent: indigo/purple (matches the proposal deck)
- Clean data tables, card-based layouts
- Chart styling: minimal, modern, no gridlines clutter
- Phone preview frame: realistic device bezel with notch

---

## What Doesn't Need to Work

- No real data persistence (refresh resets to default state)
- No real authentication
- No real payment processing
- No real image upload
- No cross-app sync — each app stands alone with matching mock data
- No responsive admin (desktop only) or desktop client (mobile only)

---

## Technical Notes

- Zero external dependencies — no React, no Tailwind CDN, no chart libraries
- All charts are SVG/CSS
- All transitions are CSS
- Photos: use royalty-free portrait images or CSS gradient placeholders with silhouettes
- PWA service worker is minimal (just enough for install prompt)
- Both apps load instantly (no spinner, no hydration)
