# GotPhoto Demo Apps — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build two static demo apps — a parent-facing mobile PWA and a photographer admin desktop website — with mock data from Bert's ChoicePix business, for screen recording a GotPhoto partnership proposal video.

**Architecture:** Two independent static web apps sharing a common mock data file. Client app is a single-page mobile PWA with screen-based navigation. Admin is a single-page desktop app with sidebar navigation and page routing. Both are vanilla HTML/CSS/JS with zero external dependencies. Use frontend-design, ui-design, and creative-web-design skills for visual quality. Use visual-perception MCP to validate designs.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties, grid, flexbox, animations), ES6+ JavaScript (modules), SVG for charts/icons, PWA (manifest + service worker)

---

## Task 1: Project Scaffolding & Mock Data

**Files:**
- Create: `data/mock.js`
- Create: `admin/index.html` (shell only)
- Create: `app/index.html` (shell only)
- Move: existing `index.html`, `styles.css`, `slides.js` → `presentation/`

**Step 1: Move existing slide deck into presentation/ folder**

```bash
mkdir -p presentation
mv index.html styles.css slides.js presentation/
mv assets presentation/ 2>/dev/null || true
```

**Step 2: Create directory structure**

```bash
mkdir -p admin/assets app/assets data
```

**Step 3: Create data/mock.js with all mock data**

Create the shared mock data module. This is the single source of truth both apps reference. Includes:
- Photographer profile (Bert Kiefer, ChoicePix Photography)
- Jobs array (Lincoln High Seniors 2026, Roosevelt Elementary Fall 2025)
- Packages array with categories, prices, descriptions, included items
- Students array (Allanah Mendoza + 4 others with names, photo indices)
- Orders array (recent 10 orders for dashboard)
- Analytics object (revenue, conversion, weekly data points for charts)
- Campaigns array (2 email campaigns with stats)
- Placeholder photo URLs (use picsum.photos or gradient-based CSS placeholders keyed by index)

Export as ES module (`export const DATA = { ... }`).

**Step 4: Create admin/index.html shell**

Minimal HTML with charset, viewport, title "ChoicePix — GotPhoto Admin", link to styles.css, script module to app.js. Empty `<div id="app">` root.

**Step 5: Create app/index.html shell**

Minimal HTML with charset, viewport (with `viewport-fit=cover`), title "ChoicePix Photos", link to styles.css, script module to app.js, link to manifest.json, theme-color meta tag. Empty `<div id="app">` root.

**Step 6: Create app/manifest.json**

PWA manifest: name "ChoicePix Photos", short_name "ChoicePix", display "standalone", background_color white, theme_color matching accent, start_url "./", icon placeholder (192 and 512).

**Step 7: Create app/sw.js**

Minimal service worker: install event caches shell files, fetch event serves cache-first. Just enough for PWA installability.

**Step 8: Verify structure**

```bash
ls -R admin/ app/ data/ presentation/
```

---

## Task 2: Client App — CSS Foundation & Navigation Shell

**Files:**
- Create: `app/styles.css`
- Create: `app/app.js`
- Modify: `app/index.html`

**Skills:** Invoke `frontend-design` and `ui-design` skills for visual quality.

**Step 1: Build app/styles.css**

Complete CSS for the mobile app. Design system:
- CSS custom properties: `--bg: #ffffff`, `--surface: #f8f9fa`, `--text: #1a1a2e`, `--text-muted: #6b7280`, `--accent: #e85d04` (warm photography tone), `--accent-light: #f4845f`, `--green: #10b981`, `--radius: 12px`
- Base reset, body max-width 430px centered (phone-width), min-height 100dvh
- Bottom tab bar: fixed bottom, 4 tabs with icons (SVG inline or unicode), active state
- Screen container: full-height minus tab bar, scrollable, transition-ready
- Screen transitions: `.screen` base hidden, `.screen.active` visible with slide animation
- Card styles for packages, photo grid, cart items
- Full-screen overlay for photo viewer
- Form styles for access code and checkout
- Utility classes for spacing, badges, pills

**Step 2: Build app/app.js navigation system**

SPA router using hash or state-based navigation:
- `screens`: object mapping screen names to render functions
- `navigate(screenName, params)`: hides current screen, shows new one with transition
- Bottom tab bar click handlers → navigate to corresponding screen
- Back button support via history or state stack
- Cart state management (in-memory array)
- Favorite photos state (in-memory Set)
- Import mock data from `../data/mock.js`

**Step 3: Update app/index.html with navigation shell**

Add bottom tab bar HTML, screen containers for all 6 screens (empty content for now), link CSS/JS.

**Step 4: Verify navigation works**

Open app/index.html on phone or in Chrome DevTools mobile emulator. Tabs should switch between empty screen containers with smooth transitions.

---

## Task 3: Client App — Access Code Screen

**Files:**
- Modify: `app/app.js`
- Modify: `app/styles.css` (if needed)

**Step 1: Build the access code entry screen**

- ChoicePix Photography logo area (text-based logo or SVG)
- "Welcome" heading
- "Enter your access code to view your photos" subtext
- Input field pre-filled with "CHOICEPIX-2026"
- "View My Photos" submit button
- Subtle school/photographer branding footer
- On submit → navigate to gallery screen

**Step 2: Verify on mobile**

Test in Chrome DevTools mobile view. Input should be easy to tap, button should be thumb-friendly, layout centered and clean.

---

## Task 4: Client App — Gallery Screen

**Files:**
- Modify: `app/app.js`
- Modify: `app/styles.css` (if needed)

**Step 1: Build photo gallery grid**

- Header: "Allanah Mendoza" with subtitle "Lincoln High Seniors 2026"
- 2-column photo grid with slight gap
- Each photo: rounded corners, subtle shadow, aspect-ratio 3:4
- Photos use placeholder images (CSS gradient portraits with varied colors, or picsum.photos URLs sized to 400x533)
- Heart icon overlay on each photo (bottom-right corner)
- Photo count: "8 photos"

**Step 2: Build full-screen photo viewer**

- Tap photo → full-screen overlay slides up
- Large photo centered
- Close button (X) top-right
- Heart button bottom-center with animation on tap
- Swipe left/right to move between photos (touch events)
- Pinch-to-zoom (CSS transform on touch)
- Photo counter "3 / 8" at top

**Step 3: Implement favorite state**

- Tapping heart toggles favorite (filled red vs outline)
- Favorites count shown in gallery header
- Heart pulse animation on favorite

**Step 4: Verify on mobile**

Full gallery flow: scroll grid, tap photo, swipe between photos, favorite some, close viewer.

---

## Task 5: Client App — Package Discovery Screen

**Files:**
- Modify: `app/app.js`
- Modify: `app/styles.css` (if needed)

**Step 1: Build category tabs and filter pills**

- Sticky top section with:
  - Category tabs: All | Digital | Prints | Canvas | Frames | Build Your Own
  - Horizontally scrollable, active tab highlighted with accent underline
  - Price filter pills below: All | Under $100 | $100-250 | $250+
- Tapping a tab/pill filters the visible packages (JS filter on mock data)

**Step 2: Build package cards**

- Visual cards for each package:
  - Product thumbnail area (gradient placeholder or icon representing category)
  - Package name (clear, descriptive)
  - Brief description (1 line: "All digital photos, full resolution, instant download")
  - Price (large, prominent)
  - "Recommended" badge on Premium Print + Digital (accent colored)
  - Included items as small pills ("8 Photos", "5 Prints", "1 Canvas")
- Cards have hover/press state (slight scale)

**Step 3: Build package detail sheet**

- Tap a package card → bottom sheet slides up
- Package name, price, full description
- Included items list with icons
- "Select Photos" primary button → navigate to photo selection
- "Add to Cart" secondary button

**Step 4: Verify filtering and detail sheet**

Test all category/price filter combinations. Test detail sheet open/close.

---

## Task 6: Client App — Photo Selection Screen

**Files:**
- Modify: `app/app.js`
- Modify: `app/styles.css` (if needed)

**Step 1: Build photo selection for a package**

- Header: package name + "Select your photos"
- Instruction text: "Choose 3 photos for your package" (count from package data)
- Photo grid with selectable state (tap to select, blue border + checkmark)
- Selected count indicator: "2 of 3 selected"
- "Continue" button enabled when correct count selected

**Step 2: Build side-by-side compare mode**

- When 2+ photos selected, show "Compare" button
- Compare view: two photos side by side, swipeable
- "Choose this one" button under each

**Step 3: Build live product preview**

- After selection, show selected photo inside a product mockup:
  - Frame: photo with a decorative border/mat
  - Canvas: photo with wrapped-edge effect (CSS box-shadow/border trick)
  - Digital: clean full-bleed photo
- CSS-only mockups — no real compositing needed

**Step 4: Verify the full selection flow**

Select a package → pick photos → compare → preview → confirm.

---

## Task 7: Client App — Cart & Checkout Screens

**Files:**
- Modify: `app/app.js`
- Modify: `app/styles.css` (if needed)

**Step 1: Build cart screen**

- Cart items list: each shows package name, selected photo thumbnail (small), price
- Remove button (X) on each item
- Upsell bar: "Add wallet prints for $15" with quick-add button
- "Add another student" link (shows a note about multi-student support)
- Subtotal at bottom
- "Proceed to Checkout" button
- Empty state: "Your cart is empty" with link to packages

**Step 2: Update tab bar cart badge**

- Cart tab shows item count badge (red circle with number)
- Badge bounces on add-to-cart

**Step 3: Build checkout screen**

- Order summary section: visual thumbnails, package names, prices, total
- Apple Pay button (black, rounded, Apple logo + "Pay with Apple Pay") — non-functional
- Divider "or pay with card"
- Card form fields (visual only): name, card number, expiry, CVV
- Gift toggle: "This is a gift" with recipient name field
- "Place Order — $XXX" button at bottom
- Tapping Place Order shows a brief success animation/screen (confetti or checkmark) then returns to gallery

**Step 4: Verify full purchase flow**

Access code → gallery → packages → select photos → cart → checkout → success.

---

## Task 8: Admin App — CSS Foundation & Layout Shell

**Files:**
- Create: `admin/styles.css`
- Create: `admin/app.js`
- Modify: `admin/index.html`

**Skills:** Invoke `frontend-design` and `ui-design` skills for visual quality.

**Step 1: Build admin/styles.css**

Complete CSS for the admin dashboard. Design system:
- CSS custom properties: `--sidebar-bg: #1a1a2e`, `--sidebar-text: #a0a0b8`, `--sidebar-active: #ffffff`, `--content-bg: #fafafa`, `--card-bg: #ffffff`, `--text: #1a1a2e`, `--text-muted: #6b7280`, `--accent: #6366f1`, `--accent-light: #818cf8`, `--green: #10b981`, `--orange: #f59e0b`, `--red: #ef4444`, `--radius: 8px`
- Sidebar: fixed left, 240px wide, dark, full height
- Content area: margin-left 240px, padding, scrollable
- Top bar: page title, search input, notification bell, profile avatar
- Card component: white bg, subtle shadow, rounded corners
- Table styles: clean rows, hover states
- Stat card styles: icon, value, label, trend indicator
- Form input styles for job detail editing
- Phone preview frame CSS (realistic iPhone bezel with notch)
- Chart container styles

**Step 2: Build admin/app.js navigation system**

SPA router:
- `pages`: object mapping page names to render functions
- `navigate(pageName, params)`: swaps content area, updates sidebar active state
- Sidebar click handlers
- Import mock data from `../data/mock.js`

**Step 3: Update admin/index.html with layout shell**

- Sidebar HTML: ChoicePix logo, nav items (Dashboard, Jobs, Packages, Analytics, Campaigns, Settings), photographer name/avatar at bottom
- Top bar HTML
- Content container `<div id="content">`
- Link CSS/JS

**Step 4: Verify layout**

Open admin/index.html in desktop browser. Sidebar should display, nav items clickable, content area switches between empty pages.

---

## Task 9: Admin App — Dashboard Page

**Files:**
- Modify: `admin/app.js`
- Modify: `admin/styles.css` (if needed)

**Step 1: Build stat cards row**

- 4 cards in a row: Revenue ($12,450 +12%), Orders (47 +8%), Active Galleries (3), Conversion (34% +5%)
- Each card: icon, large value, label, green/red trend percentage
- Cards have subtle hover lift

**Step 2: Build weekly revenue chart**

- SVG line chart: 7 data points (Mon-Sun)
- Filled area under line with gradient
- Axis labels (days), value on hover (title attribute)
- All SVG generated in JS from mock data points

**Step 3: Build recent orders table**

- Table: Student Name, Package, Amount, Time
- 8-10 rows from mock data
- Row hover highlight
- Status pill on each (Completed, Processing)

**Step 4: Build notification bell**

- Bell icon in top bar with red badge showing "3"
- Click shows a dropdown with 3 notification items (new order, gallery expiring, campaign sent)

**Step 5: Verify dashboard**

All cards render with correct data. Chart displays. Table is scrollable. Notification dropdown works.

---

## Task 10: Admin App — Jobs & Job Detail Pages

**Files:**
- Modify: `admin/app.js`
- Modify: `admin/styles.css` (if needed)

**Step 1: Build jobs list page**

- Card-based list of jobs (not a table — more visual)
- Each job card: name, status badge (Active green, Archived gray), subject count, revenue, date
- "Lincoln High Seniors 2026" prominently shown as active
- Click a job → navigate to job detail

**Step 2: Build job detail — left column (config form)**

- Editable fields: Job Name (text input), Access Code (readonly display), Archive Date (date display), Status (toggle switch Active/Archived)
- Campaign section: "Last Chance Email" toggle, "SMS Reminder" toggle
- "Save Changes" button (non-functional, just visual)
- All fields pre-populated from mock data

**Step 3: Build job detail — right column (phone preview)**

- Realistic iPhone frame (CSS): bezel, notch, rounded corners, screen area
- Inside the frame: a miniature version of the client app's package discovery screen
- Render package cards inside the phone frame using mock data
- The preview should look like a real phone showing the app

**Step 4: Build preview interactivity**

- "Preview as..." dropdown at top of phone preview: student names from mock data
- Selecting a different student changes the name shown in the phone preview header
- Mobile/Desktop toggle buttons above the phone frame
- When admin edits the job name field, the phone preview header updates in real-time (JS event listener)

**Step 5: Verify job detail page**

Navigate to job detail. Edit job name → phone preview updates. Switch preview student. The phone frame looks realistic.

---

## Task 11: Admin App — Package Manager Page

**Files:**
- Modify: `admin/app.js`
- Modify: `admin/styles.css` (if needed)

**Step 1: Build package card grid**

- Grid of package cards (2-3 columns)
- Each card: drag handle icon (three lines), package name, category pill (colored by category), price, item count
- "Add Package" button at end of grid (dashed border card)
- Cards have hover state with slight shadow increase

**Step 2: Build inline package editor**

- Click a package card → card expands to show edit form
- Editable: name (text input), category (dropdown), price (number input), description (textarea)
- Included items shown as removable chips: "8×10 Print ×" with X to remove
- "Add Item" button to add chips
- "Save" and "Cancel" buttons in expanded card
- Click Save → card collapses back to compact view with updated display

**Step 3: Verify package manager**

Click package → edit form appears inline. Edit name/price → save → card shows new values. Visual only — refresh resets.

---

## Task 12: Admin App — Analytics & Campaigns Pages

**Files:**
- Modify: `admin/app.js`
- Modify: `admin/styles.css` (if needed)

**Step 1: Build analytics page**

- Revenue over time: SVG line chart (30 days, realistic curve)
- Package popularity: horizontal bar chart (SVG) — bars for each package, sorted by revenue
- Top-selling packages: ranked list with position number, name, sales count, revenue
- Photo selection stats: simple bar chart showing which pose numbers are most selected

**Step 2: Build campaigns page**

- Campaign table: name ("Senior Gallery Now Live", "Last Chance — Archive in 3 Days"), type (Email/SMS), status (Sent/Draft), open rate, click rate
- Click a campaign → shows email preview mockup:
  - Rendered email template with ChoicePix branding, student photo placeholder, CTA button
- "AI Subject Lines" section: 3-4 pill buttons with generated subject lines, click one to "select" it (highlight)
- "Create Campaign" button (non-functional)

**Step 3: Verify analytics and campaigns**

Charts render correctly with realistic data. Campaign detail shows email preview. AI pills are clickable.

---

## Task 13: Placeholder Photos & Visual Polish

**Files:**
- Modify: `app/styles.css`, `app/app.js`
- Modify: `admin/styles.css`, `admin/app.js`
- May create: `app/assets/icon-192.png`, `app/assets/icon-512.png`

**Skills:** Invoke `ui-design` skill. Use `visual-perception` MCP to analyze screenshots of both apps and iterate on visual quality.

**Step 1: Generate or source placeholder portrait photos**

Options (in order of preference):
- Use picsum.photos with fixed seeds for consistent portraits: `https://picsum.photos/seed/portrait1/400/533`
- Or create CSS gradient-based portrait placeholders with subtle silhouette shapes
- Need 8-10 unique "photos" for the gallery
- Need small thumbnails for cards, cart, admin

**Step 2: Create PWA icons**

- Generate simple app icons (192x192 and 512x512) — can be CSS-rendered to canvas then exported, or simple SVG converted
- Camera/photo themed icon with ChoicePix branding

**Step 3: Polish client app animations**

- Screen transition: slide-in from right (forward), slide-in from left (back)
- Bottom sheet: slide up with backdrop fade
- Heart animation: scale pulse + color fill
- Cart badge: bounce on increment
- Photo viewer: fade-in backdrop, scale-up photo
- Tab switch: subtle indicator slide

**Step 4: Polish admin app interactions**

- Page transition: content fade
- Stat cards: count-up animation on page load (numbers animate from 0 to value)
- Chart lines: draw-in animation (SVG stroke-dashoffset)
- Phone preview: subtle shadow and reflection
- Sidebar active indicator: sliding highlight

**Step 5: Visual verification**

Take screenshots of both apps using visual-perception MCP. Analyze colors, composition, and overall quality. Iterate on any issues.

---

## Task 14: Final Integration & Verification

**Files:**
- All files — final review pass

**Step 1: Verify client app full flow**

Open app/index.html in Chrome DevTools mobile emulator (iPhone 14 Pro). Walk through:
1. Access code screen → submit
2. Gallery → browse photos → favorite → full-screen viewer → swipe
3. Packages tab → filter by category → filter by price → tap package → detail sheet
4. Select photos → compare → preview in product
5. Cart → upsell → checkout → success

Every screen renders correctly, transitions are smooth, all interactive elements respond.

**Step 2: Verify admin app full flow**

Open admin/index.html in desktop Chrome. Walk through:
1. Dashboard → stat cards, chart, recent orders, notifications
2. Jobs → click Lincoln High → job detail with phone preview
3. Edit job name → phone preview updates
4. Switch preview student
5. Packages → click to edit → save
6. Analytics → charts render
7. Campaigns → email preview, AI pills

**Step 3: Verify PWA installability**

Serve app/ via local HTTP server:
```bash
cd app && python3 -m http.server 8080
```
Open on phone → should show "Add to Home Screen" prompt. Install. App opens without browser chrome.

**Step 4: Cross-check mock data consistency**

Verify the same packages, prices, and student names appear in both apps. The admin shows what the parent sees.

---

## Parallelization Strategy

Tasks can be parallelized as follows:
- **Task 1** (scaffolding) must be first
- **Tasks 2-7** (client app) can run in parallel with **Tasks 8-12** (admin app) — they're independent
- **Task 13** (polish) depends on Tasks 2-12 being complete
- **Task 14** (verification) is last

Optimal execution: Task 1 → [Tasks 2-7 in sequence] parallel with [Tasks 8-12 in sequence] → Task 13 → Task 14
