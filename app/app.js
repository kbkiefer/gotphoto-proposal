import {
  PHOTOGRAPHER, GOTPHOTO_DEFAULTS, JOBS, STUDENTS, CATEGORIES, PACKAGES, PHOTOS,
  GALLERY_JOBS, getPhotoUrl, getPhotoThumb, getGroupPhotoUrl, CLIENT_ACCOUNTS,
  ALA_CARTE, ALA_CARTE_CATEGORIES
} from '../data/mock.js';

import { TEMPLATES, PACKAGE_TEMPLATES, getTemplatesForPackage } from '../templates/template-definitions.js';
import { renderTemplate, renderThumbnail } from '../templates/template-renderer.js';

// =========================================
// GLOBAL: Block pinch-to-zoom except in gallery viewer & crop
// =========================================
document.addEventListener('touchmove', e => {
  if (e.touches.length >= 2) {
    const t = e.target;
    if (t.closest('.sel-preview-crop') || t.closest('.photo-viewer')) return;
    e.preventDefault();
  }
}, { passive: false });

// Also block gesture events (Safari pinch) except in viewer & crop
['gesturestart', 'gesturechange', 'gestureend'].forEach(evt => {
  document.addEventListener(evt, e => {
    const t = e.target;
    if (t.closest('.sel-preview-crop') || t.closest('.photo-viewer')) return;
    e.preventDefault();
  }, { passive: false });
});

// =========================================
// THEME — Apply photographer's brand colors
// =========================================
function applyTheme() {
  const theme = PHOTOGRAPHER.theme || GOTPHOTO_DEFAULTS;
  const accent = theme.accent || GOTPHOTO_DEFAULTS.accent;
  const accentLight = theme.accentLight || GOTPHOTO_DEFAULTS.accentLight;
  const root = document.documentElement;
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-light', accentLight);
  // Derive accent-bg from accent with opacity
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  root.style.setProperty('--accent-bg', `rgba(${r}, ${g}, ${b}, 0.08)`);
}
applyTheme();

// =========================================
// STATE
// =========================================
const state = {
  currentScreen: 'access',
  previousScreen: null,
  history: [],
  activeTab: 'gallery',
  activeJobIndex: 0,
  cart: [],
  liked: new Set(),
  yearbookPicks: [],  // top 2 yearbook photo IDs (ordered)
  selectedPhotos: new Set(),
  selectingPackage: null,
  viewerIndex: 0,
  giftMode: false,
  activeTemplateIndex: 0,
  // Slot-based selection
  selectionSlots: [],      // [{label, photoId, templateId}]
  activeSlotIndex: 0,
  showReview: false,
  selectionTab: 'pose',    // 'pose' | 'crop' | 'favorites'
  cropOffsets: {},         // { slotIndex: { tx, ty } }
  insideJob: false,          // true once a job is selected (gallery level)
  alaCarteFilter: 'popular', // active à la carte category filter
  alaCarteQty: {},           // { productId: quantity }
  alaCarteSize: {},          // { productId: selectedSize }
};

const student = STUDENTS[0];
const job = JOBS[0];

// Active gallery job helper — returns the currently selected GALLERY_JOBS entry
function activeGalleryJob() {
  return GALLERY_JOBS[state.activeJobIndex];
}

// Active gallery photos helper
function activePhotos() {
  return activeGalleryJob().photos;
}

// Is current job a yearbook job?
function isYearbookJob() {
  return activeGalleryJob().type === 'Yearbook';
}

// Max yearbook picks for current job
function maxYearbookPicks() {
  return activeGalleryJob().yearbookPicks || 0;
}

// =========================================
// SVG ICONS
// =========================================
const icons = {
  gallery: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  packages: `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  cart: `<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  account: `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  back: `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`,
  remove: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  star: `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
};

const categoryIcons = {
  digital: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  prints: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  canvas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="1"/><rect x="5" y="5" width="14" height="14" rx="0"/><line x1="2" y1="22" x2="5" y2="19"/><line x1="22" y1="22" x2="19" y2="19"/></svg>',
  frames: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="6" width="12" height="12" rx="1"/></svg>',
  build: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
};

// =========================================
// RENDER ENGINE
// =========================================
const app = document.getElementById('app');

function buildBrandBar() {
  const showOn = ['jobs', 'gallery', 'packages', 'cart', 'account'];
  const visible = showOn.includes(state.currentScreen);
  const el = document.createElement('div');
  el.className = `brand-bar ${visible ? '' : 'hidden'}`;
  el.id = 'brandBar';
  el.style.background = PHOTOGRAPHER.theme.headerBg || '#1a1a2e';
  const logoSrc = PHOTOGRAPHER.logo;
  el.innerHTML = `
    <div class="brand-bar-inner">
      ${logoSrc
        ? `<img src="${logoSrc}" alt="${PHOTOGRAPHER.business}" class="brand-bar-logo">`
        : `<div class="brand-bar-name">${PHOTOGRAPHER.business}</div>`
      }
    </div>
  `;
  return el;
}

function render() {
  app.innerHTML = '';
  app.appendChild(buildBrandBar());
  app.appendChild(buildScreens());
  app.appendChild(buildTabBar());
  app.appendChild(buildQuickAddBanner());
  app.appendChild(buildPhotoViewer());
  app.appendChild(buildBottomSheet());
  app.appendChild(buildCompareOverlay());
  app.appendChild(buildSuccessOverlay());
  bindEvents();
  updateTabBar();
}

function buildQuickAddBanner() {
  const el = document.createElement('div');
  el.className = 'gallery-quick-add';
  el.id = 'galleryQuickAdd';
  const hidden = state.currentScreen !== 'gallery';
  if (hidden) el.classList.add('hidden');
  el.innerHTML = `
    <div class="quick-add-inner">
      <div class="quick-add-text">
        <div class="quick-add-title">Get all ${activePhotos().length} photos digitally</div>
        <div class="quick-add-price">$199 <span class="quick-add-per">— instant download</span></div>
      </div>
      <button class="quick-add-btn" data-action="quick-add">Add to Cart</button>
    </div>
  `;
  return el;
}

function buildScreens() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    ${buildAccessScreen()}
    ${buildJobSelectorScreen()}
    ${buildGalleryScreen()}
    ${buildPackagesScreen()}
    ${buildAlaCarteScreen()}
    ${buildSelectionScreen()}
    ${buildCartScreen()}
    ${buildCheckoutScreen()}
    ${buildAccountScreen()}
  `;
  return wrap;
}

// =========================================
// LOGIN SCREEN
// =========================================
function buildAccessScreen() {
  const isActive = state.currentScreen === 'access';
  const account = CLIENT_ACCOUNTS[0]; // Default mock account
  const logoSrc = PHOTOGRAPHER.logo;
  const headerBg = PHOTOGRAPHER.theme.headerBg || '#1a1a2e';
  return `
    <div class="screen ${isActive ? 'active' : ''}" data-screen="access">
      <div class="access-brand-bar" style="background:${headerBg}">
        ${logoSrc
          ? `<img src="${logoSrc}" alt="${PHOTOGRAPHER.business}" class="access-brand-logo">`
          : `<div class="access-brand-name">${PHOTOGRAPHER.business}</div>`
        }
      </div>
      <div class="access-screen">
        <h2 class="access-welcome">Sign In</h2>
        <p class="access-subtitle">Log in to view and order your photos</p>
        <div class="login-field">
          <label class="login-label">Email</label>
          <input type="email" class="access-input" id="loginEmail" value="${account.email}" readonly>
        </div>
        <div class="login-field">
          <label class="login-label">Password</label>
          <input type="password" class="access-input" id="loginPassword" value="${account.password}" readonly>
        </div>
        <button class="access-btn" id="accessSubmit">Sign In</button>
        <div class="login-footer">
          <a href="#" class="login-link">Forgot password?</a>
          <span class="login-divider">&middot;</span>
          <a href="#" class="login-link">Create account</a>
        </div>
      </div>
    </div>
  `;
}

// =========================================
// JOB SELECTOR SCREEN
// =========================================
function buildJobSelectorScreen() {
  const isActive = state.currentScreen === 'jobs';
  const cards = GALLERY_JOBS.map((gj, i) => {
    const coverUrl = getPhotoUrl(gj.photos[0].file, gj);
    const isActiveJob = gj.status === 'active';
    const groupUrl = getGroupPhotoUrl(gj);
    return `
      <div class="job-card ${isActiveJob ? 'job-card-active' : ''}" data-action="select-job" data-job-index="${i}">
        <div class="job-card-photo">
          <img src="${coverUrl}" alt="${gj.name}" loading="lazy">
          <div class="job-year-badge">${gj.year}</div>
          <div class="job-status-pill ${isActiveJob ? 'status-active' : 'status-archived'}">${isActiveJob ? 'Active' : 'Archived'}</div>
        </div>
        <div class="job-card-info">
          <div class="job-card-type">${gj.type}</div>
          <div class="job-card-grade">${gj.grade}</div>
          <div class="job-card-teacher">${gj.teacher}</div>
          <div class="job-meta">
            <span class="job-meta-photos">${gj.photos.length} photos</span>
            ${groupUrl ? '<span class="job-meta-group">+ class photo</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="screen has-tabs ${isActive ? 'active' : ''}" data-screen="jobs">
      <div class="screen-header">
        <h1>${student.name}</h1>
        <div class="subtitle">United Day School &middot; K through 4th Grade</div>
      </div>
      <div class="job-selector-list">
        ${cards}
      </div>
    </div>
  `;
}

// =========================================
// GALLERY SCREEN
// =========================================
function buildYearbookPicksBar(photos, gj) {
  const picks = state.yearbookPicks;
  const max = maxYearbookPicks();
  const slotIndices = Array.from({ length: max }, (_, i) => i);
  const slots = slotIndices.map(i => {
    const photoId = picks[i];
    const isGroup = photoId && photoId.endsWith('-group');
    const photo = photoId && !isGroup ? photos.find(p => p.id === photoId) : null;
    const thumbUrl = isGroup ? getGroupPhotoUrl(gj) : (photo ? getPhotoUrl(photo.file, gj) : null);
    if (thumbUrl) {
      return `<div class="yb-slot filled" data-yb-slot="${i}">
        <img src="${thumbUrl}" alt="${isGroup ? 'Class Photo' : photo.label}">
        ${max > 1 ? `<span class="yb-slot-num">${i + 1}</span>` : ''}
        <button class="yb-slot-remove" data-action="yb-remove" data-slot="${i}">${icons.close}</button>
      </div>`;
    }
    return `<div class="yb-slot empty" data-yb-slot="${i}">
      ${max > 1 ? `<span class="yb-slot-num">${i + 1}</span>` : `<span class="yb-slot-num">${icons.star}</span>`}
    </div>`;
  });

  const title = max === 1 ? 'Yearbook Photo Pick' : 'Yearbook Photo Picks';

  return `
    <div class="yb-picks-bar">
      <div class="yb-picks-header">
        <span class="yb-picks-icon">${icons.star}</span>
        <span class="yb-picks-title">${title}</span>
        <span class="yb-picks-count">${picks.length}/${max}</span>
      </div>
      <div class="yb-picks-slots">${slots.join('')}</div>
    </div>`;
}

function buildGalleryScreen() {
  const isActive = state.currentScreen === 'gallery';
  const gj = activeGalleryJob();
  const photos = activePhotos();
  const likedCount = state.liked.size;
  const groupUrl = getGroupPhotoUrl(gj);

  const isYB = isYearbookJob();
  const groupId = gj.id + '-group';
  const groupLiked = state.liked.has(groupId);
  const groupYbIndex = isYB ? state.yearbookPicks.indexOf(groupId) : -1;
  const groupYbPicked = groupYbIndex !== -1;
  const groupPhotoHtml = groupUrl ? `
    <div class="photo-cell-group" data-action="view-group" data-group-url="${groupUrl}">
      <img src="${groupUrl}" alt="Class Photo" loading="lazy">
      <div class="photo-group-label">Class Photo</div>
      ${isYB ? `
        <div class="photo-yb-pick photo-yb-pick-group ${groupYbPicked ? 'picked' : ''}" data-photo-id="${groupId}" data-action="yb-pick">
          ${icons.star}
          ${groupYbPicked && maxYearbookPicks() > 1 ? `<span class="yb-pick-num">${groupYbIndex + 1}</span>` : ''}
        </div>
      ` : ''}
      <div class="photo-heart photo-heart-group ${groupLiked ? 'liked' : ''}" data-photo-id="${groupId}" data-action="like">
        ${icons.heart}
      </div>
    </div>
  ` : '';
  const photosHtml = photos.map((p, i) => {
    const ybPickIndex = state.yearbookPicks.indexOf(p.id);
    const isYbPicked = ybPickIndex !== -1;
    return `
    <div class="photo-cell" data-photo-index="${i}">
      <img src="${getPhotoUrl(p.file, gj)}" alt="${p.label}" loading="lazy">
      ${isYB ? `
        <div class="photo-yb-pick ${isYbPicked ? 'picked' : ''}" data-photo-id="${p.id}" data-action="yb-pick">
          ${icons.star}
          ${isYbPicked && maxYearbookPicks() > 1 ? `<span class="yb-pick-num">${ybPickIndex + 1}</span>` : ''}
        </div>
      ` : ''}
      <div class="photo-heart ${state.liked.has(p.id) ? 'liked' : ''}" data-photo-id="${p.id}" data-action="like">
        ${icons.heart}
      </div>
    </div>`;
  }).join('');

  return `
    <div class="screen has-tabs ${isActive ? 'active' : ''}" data-screen="gallery">
      <div class="gallery-hero-header">
        <div class="gallery-hero-top">
          <button class="gallery-back-btn" data-action="back-to-jobs">${icons.back}</button>
          <div class="gallery-hero-profile">
            <img class="gallery-avatar" src="${getPhotoUrl(photos[0].file, gj)}" alt="${student.name}">
            <div class="gallery-hero-info">
              <h1 class="gallery-hero-name">${student.name}</h1>
              <div class="gallery-hero-school">${gj.name}</div>
              <div class="gallery-hero-meta">${gj.grade} &middot; ${gj.teacher}</div>
            </div>
          </div>
          <button class="gallery-share-btn" data-action="share-gallery">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
        </div>
        <div class="gallery-hero-stats">
          <div class="gallery-stat">
            <span class="gallery-stat-num">${photos.length}</span>
            <span class="gallery-stat-label">Photos</span>
          </div>
          <div class="gallery-stat-divider"></div>
          <div class="gallery-stat">
            <span class="gallery-stat-num">${likedCount}</span>
            <span class="gallery-stat-label">Favorites</span>
          </div>
          <div class="gallery-stat-divider"></div>
          <div class="gallery-stat">
            <span class="gallery-stat-num gallery-stat-countdown" id="daysLeft">${gj.status === 'active' ? '49' : '--'}</span>
            <span class="gallery-stat-label">${gj.status === 'active' ? 'Days Left' : 'Archived'}</span>
          </div>
        </div>
        ${isYB ? buildYearbookPicksBar(photos, gj) : ''}
        <div class="gallery-quick-actions">
          <button class="gallery-action-pill ${likedCount > 0 ? '' : 'disabled'}" data-action="show-favorites">
            ${icons.heart} Favorites${likedCount > 0 ? ` (${likedCount})` : ''}
          </button>
          <button class="gallery-action-pill" data-action="switch-tab" data-tab="packages">
            ${icons.packages} Shop Packages
          </button>
        </div>
      </div>
      <div class="photo-grid">
        ${groupPhotoHtml}
        ${photosHtml}
      </div>
    </div>
  `;
}

// =========================================
// PACKAGES SCREEN
// =========================================
function buildPackagesScreen() {
  const isActive = state.currentScreen === 'packages';

  const catTabs = `<div class="cat-pill active" data-cat="all">All</div>` +
    CATEGORIES.map(c => `<div class="cat-pill" data-cat="${c.id}">${c.label}</div>`).join('');

  const pricePills = ['all', 'under100', '100-250', '250+'].map((p, i) => {
    const labels = ['All', 'Under $100', '$100 - $250', '$250+'];
    return `<div class="price-pill ${i === 0 ? 'active' : ''}" data-price="${p}">${labels[i]}</div>`;
  }).join('');

  // Each package gets a different photo so cards feel personal
  const photos = activePhotos();
  const gj = activeGalleryJob();
  const cardPhotoSeeds = [
    photos[0]?.file,  // pkg-001: Digital
    photos[1]?.file,  // pkg-002: Essentials
    photos[2]?.file,  // pkg-003: Premium
    photos[3]?.file,  // pkg-004: Canvas
    photos[4]?.file,  // pkg-005: Framed
    photos[5]?.file,  // pkg-006: Wallet
    photos[0]?.file,  // pkg-007: Build Your Own
  ];

  const categoryLabels = {
    digital: 'Digital',
    prints: 'Prints',
    canvas: 'Wall Art',
    frames: 'Framed',
    build: 'Custom',
  };

  const cards = PACKAGES.map((pkg, idx) => {
    const cat = CATEGORIES.find(c => c.id === pkg.category);
    const icon = categoryIcons[pkg.category] || '';
    const photoSeed = cardPhotoSeeds[idx] || photos[0]?.file;
    const catLabel = categoryLabels[pkg.category] || pkg.category;

    return `
      <div class="package-card package-card-split" data-pkg-id="${pkg.id}" data-cat="${pkg.category}" data-price="${pkg.price}">
        <div class="package-photo-col">
          <img src="${getPhotoUrl(photoSeed, gj)}" alt="${pkg.name}" loading="lazy">
          ${pkg.recommended ? '<div class="package-badge">Recommended</div>' : ''}
          ${pkg.popular && !pkg.recommended ? '<div class="package-popular">Popular</div>' : ''}
        </div>
        <div class="package-info-col">
          <div class="package-type-badge-inline">${icon} ${catLabel}</div>
          <div class="package-name">${pkg.name}</div>
          <div class="package-desc">${pkg.description}</div>
          <div class="package-price-row">
            ${pkg.isCustom ? '<span class="package-price-custom">Custom Pricing</span>' : `<span class="package-price-amount">$${pkg.price}</span>`}
          </div>
          <div class="package-includes-compact">
            ${pkg.includes.slice(0, 3).map(item => `<div class="include-line">${item}</div>`).join('')}
            ${pkg.includes.length > 3 ? `<div class="include-more">+${pkg.includes.length - 3} more</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="screen has-tabs ${isActive ? 'active' : ''}" data-screen="packages">
      <div class="screen-header">
        <h1>Packages</h1>
        <div class="subtitle">Choose the perfect package for your photos</div>
      </div>
      <div class="filter-section">
        <div class="filter-group">
          <div class="filter-label">Browse by type</div>
          <div class="category-tabs">${catTabs}</div>
        </div>
        <div class="filter-divider"></div>
        <div class="filter-group">
          <div class="filter-label">Price range</div>
          <div class="price-pills">${pricePills}</div>
        </div>
      </div>
      <div class="package-list" id="packageList">
        ${cards}
      </div>
    </div>
  `;
}

// =========================================
// À LA CARTE SCREEN
// =========================================
function buildAlaCarteScreen() {
  const isActive = state.currentScreen === 'alacarte';
  const filter = state.alaCarteFilter;
  const photos = activePhotos();
  const gj = activeGalleryJob();
  const sampleUrl = getPhotoUrl(photos[0]?.file, gj);

  const filterTabs = ALA_CARTE_CATEGORIES.map(cat =>
    `<button class="alc-filter-tab ${filter === cat.id ? 'active' : ''}" data-alc-filter="${cat.id}">${cat.label}</button>`
  ).join('');

  // Filter products: 'popular' shows items marked popular, others filter by category
  const filtered = ALA_CARTE.filter(p =>
    filter === 'popular' ? p.popular : p.category === filter
  );

  const upsellBanner = `
    <div class="alc-upsell">
      <div class="alc-upsell-icon">
        <img src="${sampleUrl}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">
      </div>
      <div class="alc-upsell-text">
        <div class="alc-upsell-title">Save money with our package deals</div>
        <button class="alc-upsell-link" data-action="alc-browse-packages">Browse packages →</button>
      </div>
    </div>`;

  const productCards = filtered.map(product => {
    const qty = state.alaCarteQty[product.id] || 1;
    const selectedSize = state.alaCarteSize[product.id] || product.defaultSize || null;

    const sizeSelector = product.sizes ? `
      <div class="alc-size-row">
        <select class="alc-size-select" data-alc-id="${product.id}">
          ${product.sizes.map(s => `<option value="${s}" ${s === selectedSize ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <div class="alc-qty-row">
          <button class="alc-qty-btn" data-alc-qty-dec="${product.id}">−</button>
          <span class="alc-qty-val">${qty}</span>
          <button class="alc-qty-btn" data-alc-qty-inc="${product.id}">+</button>
        </div>
      </div>
    ` : product.sizeLabel ? `
      <div class="alc-size-row">
        <div class="alc-size-fixed">One size: ${product.sizeLabel}</div>
        <div class="alc-qty-row">
          <button class="alc-qty-btn" data-alc-qty-dec="${product.id}">−</button>
          <span class="alc-qty-val">${qty}</span>
          <button class="alc-qty-btn" data-alc-qty-inc="${product.id}">+</button>
        </div>
      </div>
    ` : `
      <div class="alc-size-row">
        <div></div>
        <div class="alc-qty-row">
          <button class="alc-qty-btn" data-alc-qty-dec="${product.id}">−</button>
          <span class="alc-qty-val">${qty}</span>
          <button class="alc-qty-btn" data-alc-qty-inc="${product.id}">+</button>
        </div>
      </div>
    `;

    return `
      <div class="alc-product-card">
        ${product.popular ? '<div class="alc-popular-badge">★ Popular</div>' : ''}
        <div class="alc-product-header">
          <div class="alc-product-name">${product.name}</div>
          <div class="alc-product-price">${product.fromPrice ? 'From ' : ''}$${product.price.toFixed(2)}</div>
        </div>
        <div class="alc-product-desc">${product.desc}</div>
        <div class="alc-product-body">
          <div class="alc-product-photo">
            <img src="${sampleUrl}" alt="${product.name}">
          </div>
          <div class="alc-product-controls">
            <button class="alc-view-details" data-alc-details="${product.id}">View details</button>
            ${sizeSelector}
            <button class="alc-customize-btn" data-alc-customize="${product.id}">⊞ Customize photo</button>
            <button class="alc-add-cart-btn" data-alc-add="${product.id}">🛒 Add to cart</button>
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="screen ${isActive ? 'active' : ''}" data-screen="alacarte">
      <div class="screen-header alc-header">
        <button class="back-btn" data-action="alc-back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1>Select Products</h1>
          <div class="subtitle">Build your own custom order</div>
        </div>
      </div>
      <div class="alc-filter-row">${filterTabs}</div>
      ${upsellBanner}
      <div class="alc-section-label">${ALA_CARTE_CATEGORIES.find(c => c.id === filter)?.label || 'Products'}</div>
      <div class="alc-product-list">
        ${productCards}
      </div>
    </div>
  `;
}

// =========================================
// PHOTO SELECTION SCREEN — Slot-Based
// =========================================

// Build slots for a package based on its includes
function buildSlotsForPackage(pkg) {
  if (!pkg) return [];
  const slots = [];
  pkg.includes.forEach(item => {
    // Parse "2 — 8×10 prints" style strings
    const match = item.match(/^(\d+)\s*[—–-]\s*(.+)/);
    if (match) {
      const count = parseInt(match[1]);
      const label = match[2].trim();
      for (let i = 0; i < count; i++) {
        slots.push({
          label: count > 1 ? `${label} #${i + 1}` : label,
          photoId: null,
          templateId: null,
        });
      }
    } else if (!item.toLowerCase().includes('release') && !item.toLowerCase().includes('hardware') &&
               !item.toLowerCase().includes('resolution') && !item.toLowerCase().includes('download') &&
               !item.toLowerCase().includes('custom') && !item.toLowerCase().includes('finish') &&
               !item.toLowerCase().includes('coordinating') && !item.toLowerCase().includes('wrap')) {
      // Non-quantity items like "All digital photos"
      slots.push({
        label: item,
        photoId: null,
        templateId: null,
      });
    }
  });
  // Minimum 1 slot
  if (slots.length === 0) {
    slots.push({ label: 'Photo', photoId: null, templateId: null });
  }
  return slots;
}

function buildSelectionScreen() {
  const isActive = state.currentScreen === 'selection';
  const pkg = state.selectingPackage;
  const slots = state.selectionSlots;
  const photos = activePhotos();
  const filledCount = slots.filter(s => s.photoId).length;
  const totalSlots = slots.length;
  const allFilled = totalSlots > 0 && filledCount === totalSlots;

  // Not in selection mode — return empty placeholder
  if (!isActive && !pkg) {
    return `<div class="screen" data-screen="selection"></div>`;
  }

  // Review mode — all slots filled, show summary
  if (allFilled && state.showReview) {
    const reviewItems = slots.map((slot, i) => {
      const photo = photos.find(p => p.id === slot.photoId);
      return `
        <div class="review-item">
          <img class="review-thumb" src="${getPhotoThumb(photo.file)}" alt="${photo.label}">
          <div class="review-item-info">
            <div class="review-item-label">${slot.label}</div>
            <div class="review-item-pose">${photo.label}</div>
          </div>
          <button class="review-swap" data-action="swap-slot" data-slot-index="${i}">Swap</button>
        </div>
      `;
    }).join('');

    return `
      <div class="screen ${isActive ? 'active' : ''}" data-screen="selection">
        <div class="selection-header">
          <button class="selection-back" data-action="back-from-review">
            ${icons.back} Back
          </button>
          <div class="selection-title">Review Your Selections</div>
          <div class="selection-subtitle">${pkg ? pkg.name : ''}</div>
        </div>
        <div class="review-list">${reviewItems}</div>
        <div class="selection-footer">
          <button class="btn-continue btn-continue-pulse" data-action="add-to-cart">Add to Cart — $${pkg ? pkg.price : 0}</button>
        </div>
      </div>
    `;
  }

  // Picking mode — one slot at a time
  const activeSlot = slots[state.activeSlotIndex] || null;
  const activePhoto = activeSlot?.photoId ? photos.find(p => p.id === activeSlot.photoId) : null;
  const selectionTab = state.selectionTab || 'pose'; // 'pose' | 'crop' | 'favorites'

  // Split photos: liked first, then the rest
  const likedPhotos = photos.filter(p => state.liked.has(p.id));
  const otherPhotos = photos.filter(p => !state.liked.has(p.id));

  function buildPhotoCell(p) {
    const isSelected = activeSlot?.photoId === p.id;
    const usedInOther = slots.some((s, i) => i !== state.activeSlotIndex && s.photoId === p.id);
    const isLiked = state.liked.has(p.id);
    return `
      <div class="pose-cell-v2 ${isSelected ? 'pose-selected' : ''} ${usedInOther ? 'pose-used' : ''}" data-action="pick-pose" data-photo-id="${p.id}">
        <div class="pose-cell-img">
          <img src="${getPhotoThumb(p.file)}" alt="${p.label}" loading="lazy">
          ${isSelected ? `<div class="pose-check">${icons.check}</div>` : ''}
          ${usedInOther ? '<div class="pose-used-badge">Used</div>' : ''}
          ${isLiked && !isSelected ? '<div class="pose-heart-badge">' + icons.heart + '</div>' : ''}
        </div>
        <div class="pose-cell-label">${p.label}</div>
      </div>
    `;
  }

  // Large preview area
  const previewHtml = activePhoto
    ? `<div class="sel-preview">
        <div class="sel-preview-img ${selectionTab === 'crop' ? 'sel-preview-crop' : ''}">
          <img src="${getPhotoUrl(activePhoto.file, activeGalleryJob())}" alt="${activePhoto.label}" id="selPreviewImg">
          ${selectionTab === 'crop' ? '<div class="sel-crop-overlay"><div class="sel-crop-frame" id="selCropFrame"></div></div>' : ''}
        </div>
        <div class="sel-preview-label">${activePhoto.label}</div>
      </div>`
    : `<div class="sel-preview sel-preview-empty">
        <div class="sel-preview-placeholder">
          <div class="sel-preview-icon">${icons.gallery}</div>
          <span>Select a pose below</span>
        </div>
      </div>`;

  // Pose/Crop/Favorites tabs
  const hasFavs = likedPhotos.length > 0;
  const tabsHtml = `
    <div class="sel-tabs">
      <button class="sel-tab ${selectionTab === 'pose' ? 'active' : ''}" data-action="sel-tab" data-tab="pose">
        ${icons.gallery} Pose
      </button>
      <button class="sel-tab ${selectionTab === 'crop' ? 'active' : ''} ${!activePhoto ? 'disabled' : ''}" data-action="sel-tab" data-tab="crop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v6h6"/><path d="M18 22v-6h-6"/><path d="M6 8l12 8"/></svg> Crop
      </button>
      ${hasFavs ? `<button class="sel-tab ${selectionTab === 'favorites' ? 'active' : ''}" data-action="sel-tab" data-tab="favorites">
        ${icons.heart} Favorites <span class="sel-tab-count">${likedPhotos.length}</span>
      </button>` : ''}
    </div>
  `;

  // Crop state for this slot
  const slotCropOffset = state.cropOffsets[state.activeSlotIndex];
  const cropConfirmed = activeSlot?.photoId && slotCropOffset?.confirmed;

  // Tab content
  let tabContentHtml = '';
  if (selectionTab === 'pose' || selectionTab === 'favorites') {
    const showPhotos = selectionTab === 'favorites' ? likedPhotos : photos;
    const sectionTitle = selectionTab === 'favorites' ? 'Your Favorites' : 'Select a pose';
    tabContentHtml = `
      <div class="sel-poses-section">
        <div class="sel-poses-title">${sectionTitle}</div>
        <div class="sel-pose-strip">${showPhotos.map(buildPhotoCell).join('')}</div>
      </div>
    `;
  } else if (selectionTab === 'crop') {
    tabContentHtml = `
      <div class="sel-crop-section">
        <div class="sel-crop-hint">${cropConfirmed ? 'Crop confirmed! Adjust again or continue.' : 'Drag the photo to reposition within the frame'}</div>
        <div class="sel-crop-actions">
          <button class="sel-crop-btn" data-action="crop-reset">${icons.back} Reset</button>
          <button class="sel-crop-btn sel-crop-confirm-btn ${cropConfirmed ? 'confirmed' : ''}" data-action="crop-confirm">
            ${cropConfirmed ? icons.check + ' Confirmed' : icons.check + ' Confirm Crop'}
          </button>
        </div>
      </div>
    `;
  }

  // Filled slots mini-strip
  const miniItems = slots.map((s, i) => {
    if (!s.photoId) return `<div class="mini-slot mini-slot-empty" data-action="jump-slot" data-slot-index="${i}"><span>${i + 1}</span></div>`;
    const photo = photos.find(p => p.id === s.photoId);
    const isCurrent = i === state.activeSlotIndex;
    return `
      <div class="mini-slot ${isCurrent ? 'mini-slot-current' : ''}" data-action="jump-slot" data-slot-index="${i}">
        <img src="${getPhotoThumb(photo.file)}" alt="${photo.label}">
      </div>`;
  }).join('');
  const miniStripHtml = `<div class="mini-strip">${miniItems}</div>`;

  return `
    <div class="screen ${isActive ? 'active' : ''}" data-screen="selection">
      <div class="selection-header">
        <button class="selection-back" data-action="back-from-selection">
          ${icons.back} Back
        </button>
        <div class="selection-header-right">
          <div class="selection-title">${pkg ? pkg.name : 'Select Photos'}</div>
          <div class="pick-prompt-step">Photo ${state.activeSlotIndex + 1} of ${totalSlots} — ${activeSlot ? activeSlot.label : ''}</div>
        </div>
      </div>

      <div class="selection-progress-bar">
        <div class="selection-progress-fill" style="width: ${totalSlots > 0 ? (filledCount / totalSlots * 100) : 0}%"></div>
      </div>

      <div class="selection-body">
        ${previewHtml}
        ${tabsHtml}
        ${tabContentHtml}
      </div>

      <div class="selection-footer">
        ${miniStripHtml}
        ${allFilled ? `
          <button class="btn-continue btn-continue-pulse" data-action="show-review">
            Review & Add to Cart
          </button>
        ` : activePhoto ? `
          <button class="btn-continue" data-action="next-slot">
            ${icons.check} Confirm & Next Photo
          </button>
        ` : `
          <button class="btn-continue" disabled>
            Select a Pose
          </button>
        `}
      </div>
    </div>
  `;
}

// =========================================
// CART SCREEN
// =========================================
function buildCartScreen() {
  const isActive = state.currentScreen === 'cart';
  const subtotal = state.cart.reduce((sum, item) => sum + item.price, 0);

  if (state.cart.length === 0) {
    return `
      <div class="screen has-tabs ${isActive ? 'active' : ''}" data-screen="cart">
        <div class="screen-header">
          <h1>Cart</h1>
        </div>
        <div class="cart-empty">
          <div class="cart-empty-icon">${icons.cart}</div>
          <h3>Your cart is empty</h3>
          <p>Browse packages to find the perfect prints</p>
        </div>
      </div>
    `;
  }

  const items = state.cart.map((item, i) => {
    const photoSeed = item.photos[0] ? (activePhotos().find(p => p.id === item.photos[0])?.file || activePhotos()[0].file) : activePhotos()[0].file;
    return `
      <div class="cart-item">
        <img class="cart-thumb" src="${getPhotoThumb(photoSeed)}" alt="">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.packageName}</div>
          <div class="cart-item-detail">${item.photos.length} photo${item.photos.length !== 1 ? 's' : ''} selected</div>
        </div>
        <div class="cart-item-price">$${item.price}</div>
        <button class="cart-remove" data-remove-cart="${i}">${icons.remove}</button>
      </div>
    `;
  }).join('');

  return `
    <div class="screen has-tabs ${isActive ? 'active' : ''}" data-screen="cart">
      <div class="screen-header">
        <h1>Cart</h1>
        <div class="subtitle">${state.cart.length} item${state.cart.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="cart-list">${items}</div>
      <div class="upsell-bar">
        <div class="upsell-text">Add wallet prints for $15</div>
        <button class="upsell-add" data-action="upsell">+</button>
      </div>
      <button class="cart-add-student" data-action="add-student">+ Add another student</button>
      <div class="cart-footer">
        <div class="cart-subtotal">
          <span class="cart-subtotal-label">Subtotal</span>
          <span class="cart-subtotal-amount">$${subtotal}</span>
        </div>
        <button class="btn-primary" data-action="checkout">Proceed to Checkout</button>
      </div>
    </div>
  `;
}

// =========================================
// CHECKOUT SCREEN
// =========================================
function buildCheckoutScreen() {
  const isActive = state.currentScreen === 'checkout';
  const subtotal = state.cart.reduce((sum, item) => sum + item.price, 0);

  const thumbs = state.cart.flatMap(item =>
    item.photos.slice(0, 2).map(pid => {
      const photo = activePhotos().find(p => p.id === pid);
      return photo ? `<img class="checkout-item-thumb" src="${getPhotoThumb(photo.file)}" alt="">` : '';
    })
  ).join('');

  return `
    <div class="screen ${isActive ? 'active' : ''}" data-screen="checkout">
      <div class="screen-header">
        <button class="checkout-back" data-action="back-from-checkout">
          ${icons.back} Cart
        </button>
        <h1>Checkout</h1>
      </div>
      <div class="checkout-summary">
        <div class="checkout-items">${thumbs}</div>
      </div>
      <button class="apple-pay-btn" data-action="place-order">
        <svg viewBox="0 0 170 40" class="apple-pay-logo" fill="#fff"><path d="M30.4 6.2c-1.7 2-4.4 3.5-7.1 3.3-.3-2.7.9-5.5 2.5-7.3C27.5.2 30.4-1.2 32.8-1.3c.3 2.8-.8 5.6-2.4 7.5zm2.4 3.8c-3.9-.2-7.3 2.2-9.1 2.2-1.9 0-4.7-2.1-7.8-2-4 .1-7.7 2.3-9.8 5.9-4.2 7.2-1.1 17.9 3 23.8 2 2.9 4.4 6.2 7.6 6.1 3-.1 4.2-2 7.8-2s4.7 2 7.9 1.9c3.3-.1 5.3-3 7.3-5.9 2.3-3.4 3.2-6.6 3.2-6.8-.1 0-6.2-2.4-6.3-9.4 0-5.9 4.8-8.7 5-8.9-2.7-4-7-4.5-8.8-4.9zm36.5-6.9v37.6h5.8V29.3h8c7.3 0 12.5-5 12.5-12.3 0-7.3-5-12.2-12.2-12.2H69.3zm5.8 5h6.7c5 0 7.9 2.7 7.9 7.3s-2.8 7.3-7.9 7.3h-6.7V8.1zm30.5 32.9c3.6 0 7-2 8.5-5h.1v4.7h5.4V22.4c0-5.4-4.3-8.9-10.9-8.9-6.2 0-10.6 3.5-10.8 8.4h5.2c.4-2.3 2.6-3.8 5.3-3.8 3.4 0 5.4 1.6 5.4 4.5v2l-7 .4c-6.5.4-10.1 3.1-10.1 7.8.1 4.8 3.7 8 9.9 8zm1.6-4.4c-3 0-4.9-1.4-4.9-3.6 0-3.7 1.8-4.2 6.6-4.5l6.2-.4v2c0 3.8-3.2 6.5-7.9 6.5zm22.2 14.6c5.7 0 8.4-2.2 10.7-8.7l10.3-28.9h-5.9l-6.9 22.5h-.1l-6.9-22.5h-6.1l9.9 27.4-.5 1.7c-.9 2.8-2.3 3.9-4.8 3.9-.5 0-1.3 0-1.7-.1v4.5c.4.1 1.5.2 2 .2z" transform="translate(0,5) scale(0.9)"/></svg>
      </button>
      <div class="divider">or pay with card</div>
      <div class="checkout-form">
        <div class="form-group">
          <label class="form-label">Name on card</label>
          <input class="form-input" type="text" placeholder="Jane Mendoza" value="Jane Mendoza">
        </div>
        <div class="form-group">
          <label class="form-label">Card number</label>
          <input class="form-input" type="text" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Expiry</label>
            <input class="form-input" type="text" placeholder="12/28" value="12/28">
          </div>
          <div class="form-group">
            <label class="form-label">CVV</label>
            <input class="form-input" type="text" placeholder="123" value="123">
          </div>
        </div>
      </div>
      <div class="gift-toggle">
        <span class="gift-label">This is a gift</span>
        <button class="toggle-switch ${state.giftMode ? 'on' : ''}" data-action="toggle-gift"></button>
      </div>
      <div class="gift-recipient ${state.giftMode ? 'show' : ''}">
        <div class="form-group">
          <label class="form-label">Recipient name</label>
          <input class="form-input" type="text" placeholder="Angie Kiefer" value="Angie Kiefer">
        </div>
      </div>
      <button class="checkout-total-btn" data-action="place-order">Place Order &mdash; $${subtotal}</button>
    </div>
  `;
}

// =========================================
// ACCOUNT SCREEN
// =========================================
function buildAccountScreen() {
  const isActive = state.currentScreen === 'account';
  const initials = student.name.split(' ').map(n => n[0]).join('');
  return `
    <div class="screen has-tabs ${isActive ? 'active' : ''}" data-screen="account">
      <div class="screen-header">
        <h1>Account</h1>
      </div>
      <div class="account-card">
        <img class="account-avatar-photo" src="${getPhotoUrl(activePhotos()[0].file, activeGalleryJob())}" alt="${student.name}">
        <div class="account-name">${student.name}</div>
        <div class="account-detail">${activeGalleryJob().grade} &middot; ${activeGalleryJob().name}</div>
      </div>
      <div class="screen-padded">
        <div class="account-item">
          <span>Access Code</span>
          <span class="value">${job.accessCode}</span>
        </div>
        <div class="account-item">
          <span>Photos</span>
          <span class="value">${student.photoCount}</span>
        </div>
        <div class="account-item">
          <span>Photographer</span>
          <span class="value">${PHOTOGRAPHER.business}</span>
        </div>
        <div class="account-item">
          <span>Gallery Expires</span>
          <span class="value">April 30, 2026</span>
        </div>
        <button class="signout-btn" data-action="signout">Sign Out</button>
      </div>
    </div>
  `;
}

// =========================================
// TAB BAR
// =========================================
function buildTabBar() {
  const hidden = state.currentScreen === 'access' || state.currentScreen === 'selection' || state.currentScreen === 'checkout';
  const isJobsLevel = !state.insideJob;

  const jobsTabs = [
    { id: 'jobs', label: 'My Photos', icon: icons.gallery },
    { id: 'account', label: 'Account', icon: icons.account },
  ];

  const galleryTabs = [
    { id: 'gallery', label: 'Gallery', icon: icons.gallery },
    { id: 'packages', label: 'Packages', icon: icons.packages },
    { id: 'cart', label: 'Cart', icon: icons.cart },
    { id: 'account', label: 'Account', icon: icons.account },
  ];

  const tabs = isJobsLevel ? jobsTabs : galleryTabs;

  const el = document.createElement('nav');
  el.className = `tab-bar ${hidden ? 'hidden' : ''}`;
  el.id = 'tabBar';
  el.innerHTML = tabs.map(t => `
    <button class="tab-item ${state.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">
      ${t.icon}
      <span>${t.label}</span>
      ${t.id === 'cart' ? `<div class="tab-badge ${state.cart.length > 0 ? 'visible' : ''}" id="cartBadge">${state.cart.length}</div>` : ''}
    </button>
  `).join('');
  return el;
}

function updateTabBar() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = state.cart.length;
    badge.classList.toggle('visible', state.cart.length > 0);
  }
}

// =========================================
// PHOTO VIEWER
// =========================================
function buildPhotoViewer() {
  const el = document.createElement('div');
  el.className = 'photo-viewer';
  el.id = 'photoViewer';
  const photos = activePhotos();
  const gj = activeGalleryJob();
  const photo = photos[state.viewerIndex];
  const isLiked = photo ? state.liked.has(photo.id) : false;
  const isYB = isYearbookJob();
  const isYbPicked = isYB && photo ? state.yearbookPicks.includes(photo.id) : false;
  const ybPickIndex = isYB && photo ? state.yearbookPicks.indexOf(photo.id) : -1;

  const chevronLeft = `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`;
  const chevronRight = `<svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>`;

  const stripHtml = photos.map((p, i) => `
    <div class="viewer-strip-thumb ${i === state.viewerIndex ? 'active' : ''}" data-action="viewer-strip-goto" data-strip-index="${i}">
      <img src="${getPhotoUrl(p.file, gj)}" alt="${p.label}" loading="lazy">
    </div>
  `).join('');

  el.innerHTML = `
    <div class="viewer-counter" id="viewerCounter">${state.viewerIndex + 1} of ${photos.length}</div>
    <button class="viewer-close" data-action="close-viewer">${icons.close}</button>
    <div class="viewer-slide-container" id="viewerSlideContainer">
      <div class="viewer-image-wrap" id="viewerImageWrap">
        <img id="viewerImage" src="${photo ? getPhotoUrl(photo.file, gj) : ''}" alt="">
      </div>
    </div>
    <div class="viewer-actions">
      <button class="viewer-heart-btn ${isLiked ? 'liked' : ''}" id="viewerHeart" data-action="viewer-like">${icons.heart}</button>
      ${isYB ? `<button class="viewer-star-btn ${isYbPicked ? 'picked' : ''}" id="viewerStar" data-action="viewer-yb-pick">
        ${icons.star}
        ${isYbPicked && maxYearbookPicks() > 1 ? `<span class="viewer-star-num">${ybPickIndex + 1}</span>` : ''}
      </button>` : ''}
    </div>
    <div class="viewer-strip" id="viewerStrip">${stripHtml}</div>
  `;
  return el;
}

// =========================================
// BOTTOM SHEET
// =========================================
function buildBottomSheet() {
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.id = 'sheetBackdrop';

  const sheet = document.createElement('div');
  sheet.className = 'bottom-sheet';
  sheet.id = 'bottomSheet';
  sheet.innerHTML = `<div class="sheet-handle"></div><div class="sheet-content" id="sheetContent"></div><div class="sheet-buttons" id="sheetButtons"></div>`;

  const frag = document.createDocumentFragment();
  frag.appendChild(backdrop);
  frag.appendChild(sheet);
  return frag;
}

function openSheet(pkgId) {
  const pkg = PACKAGES.find(p => p.id === pkgId);
  if (!pkg) return;

  const content = document.getElementById('sheetContent');
  const sheetTemplates = getTemplatesForPackage(pkg.id);
  const samplePhotoUrl = getPhotoUrl(activePhotos()[0].file, activeGalleryJob());
  const templateRowHtml = sheetTemplates.length > 0 ? `
    <div class="sheet-templates-section">
      <div class="sheet-templates-label">Product Preview</div>
      <div class="sheet-templates-row">
        ${sheetTemplates.map(tmpl => {
          // Scale width so all templates have ~same visual height (~120px)
          const targetH = 120;
          const w = Math.round(targetH * tmpl.aspect);
          return `
          <div class="sheet-template-item">
            <div class="sheet-template-render">${renderTemplate(tmpl.id, samplePhotoUrl, w)}</div>
            <div class="sheet-template-name">${tmpl.name}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  ` : '';

  content.innerHTML = `
    <div class="sheet-title">${pkg.name}</div>
    <div class="sheet-price">${pkg.isCustom ? 'Custom pricing' : `$${pkg.price}`}</div>
    <div class="sheet-desc">${pkg.description}</div>
    ${templateRowHtml}
    <ul class="sheet-includes-list">
      ${pkg.includes.map(item => `<li><span class="sheet-check">${icons.check}</span>${item}</li>`).join('')}
    </ul>
  `;

  document.getElementById('sheetButtons').innerHTML = `
    <button class="btn-primary" data-action="select-photos" data-pkg-id="${pkg.id}">Select Photos</button>
    <button class="btn-secondary" data-action="quick-add-cart" data-pkg-id="${pkg.id}">Add to Cart</button>
  `;

  document.getElementById('sheetBackdrop').classList.add('open');
  document.getElementById('bottomSheet').classList.add('open');
}

function closeSheet() {
  document.getElementById('sheetBackdrop')?.classList.remove('open');
  document.getElementById('bottomSheet')?.classList.remove('open');
}

// =========================================
// COMPARE OVERLAY
// =========================================
function buildCompareOverlay() {
  const el = document.createElement('div');
  el.className = 'compare-overlay';
  el.id = 'compareOverlay';
  el.innerHTML = `
    <button class="viewer-close" data-action="close-compare">${icons.close}</button>
    <div class="compare-images" id="compareImages"></div>
    <div class="compare-label">Side-by-side comparison</div>
  `;
  return el;
}

// =========================================
// SUCCESS OVERLAY
// =========================================
function buildSuccessOverlay() {
  const el = document.createElement('div');
  el.className = 'success-overlay';
  el.id = 'successOverlay';
  el.innerHTML = `
    <div class="success-check">${icons.check}</div>
    <div class="success-title">Order Confirmed!</div>
    <div class="success-subtitle">You'll receive a confirmation email shortly.</div>
  `;
  return el;
}

// =========================================
// NAVIGATION
// =========================================
function navigate(screen, params = {}) {
  state.previousScreen = state.currentScreen;
  state.history.push(state.currentScreen);
  state.currentScreen = screen;

  if (screen === 'jobs') state.insideJob = false;
  if (['jobs', 'gallery', 'packages', 'cart', 'account'].includes(screen)) {
    state.activeTab = screen;
  }

  if (params.package) {
    state.selectingPackage = params.package;
    state.selectedPhotos.clear();
    state.activeTemplateIndex = 0;
    state.selectionSlots = buildSlotsForPackage(params.package);
    state.activeSlotIndex = 0;
    state.showReview = false;
    state.selectionTab = 'pose';
    state.cropOffsets = {};
  }

  if (params.jobIndex !== undefined) {
    state.activeJobIndex = params.jobIndex;
    state.liked.clear();
    state.yearbookPicks = [];
    state.viewerIndex = 0;
  }

  render();
}

function goBack() {
  if (state.history.length > 0) {
    state.currentScreen = state.history.pop();
    if (state.currentScreen === 'jobs') state.insideJob = false;
    if (['jobs', 'gallery', 'packages', 'cart', 'account'].includes(state.currentScreen)) {
      state.activeTab = state.currentScreen;
    }
    render();
  }
}

// =========================================
// VIEWER
// =========================================
function openViewer(index) {
  state.viewerIndex = index;
  state.viewerGroupMode = false;
  const viewer = document.getElementById('photoViewer');
  updateViewerImage();
  viewer.classList.add('open');
}

function openGroupViewer(url) {
  state.viewerGroupMode = true;
  const viewer = document.getElementById('photoViewer');
  const img = document.getElementById('viewerImage');
  const counter = document.getElementById('viewerCounter');
  const heartBtn = document.getElementById('viewerHeart');
  const strip = document.getElementById('viewerStrip');
  const navPrev = viewer?.querySelector('.viewer-nav-prev');
  const navNext = viewer?.querySelector('.viewer-nav-next');
  if (img) img.src = url;
  if (counter) counter.style.display = 'none';
  if (strip) strip.style.display = 'none';
  if (navPrev) navPrev.style.display = 'none';
  if (navNext) navNext.style.display = 'none';
  viewer.classList.add('open');
}

function closeViewer() {
  const viewer = document.getElementById('photoViewer');
  if (!viewer) return;

  // Collapse animation
  viewer.classList.add('viewer-collapsing');
  viewer.classList.remove('open');

  setTimeout(() => {
    viewer.classList.remove('viewer-collapsing');
    if (state.viewerGroupMode) {
      const counter = document.getElementById('viewerCounter');
      const heartBtn = document.getElementById('viewerHeart');
      const strip = document.getElementById('viewerStrip');
      if (counter) counter.style.display = '';
      if (heartBtn) heartBtn.style.display = '';
      if (strip) strip.style.display = '';
      state.viewerGroupMode = false;
    }
  }, 350);
}

let _viewerSliding = false;

function updateViewerImage() {
  const photos = activePhotos();
  const gj = activeGalleryJob();
  const photo = photos[state.viewerIndex];
  if (!photo) return;
  const img = document.getElementById('viewerImage');
  const counter = document.getElementById('viewerCounter');
  const heartBtn = document.getElementById('viewerHeart');
  if (img) img.src = getPhotoUrl(photo.file, gj);
  if (counter) counter.textContent = `${state.viewerIndex + 1} of ${photos.length}`;
  if (heartBtn) heartBtn.classList.toggle('liked', state.liked.has(photo.id));

  // Update yearbook star
  const isYB = isYearbookJob();
  const starBtn = document.getElementById('viewerStar');
  if (starBtn && isYB) {
    const isYbPicked = state.yearbookPicks.includes(photo.id);
    const ybPickIndex = state.yearbookPicks.indexOf(photo.id);
    starBtn.classList.toggle('picked', isYbPicked);
    const numSpan = starBtn.querySelector('.viewer-star-num');
    if (numSpan) {
      if (isYbPicked && maxYearbookPicks() > 1) {
        numSpan.textContent = ybPickIndex + 1;
        numSpan.style.display = '';
      } else {
        numSpan.style.display = 'none';
      }
    }
  }

  // Update strip active state
  updateViewerStrip();
}

function updateViewerStrip() {
  const strip = document.getElementById('viewerStrip');
  if (!strip) return;
  const thumbs = strip.querySelectorAll('.viewer-strip-thumb');
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === state.viewerIndex);
  });
  // Auto-scroll to keep active thumb centered
  const activeThumb = strip.querySelector('.viewer-strip-thumb.active');
  if (activeThumb) {
    const stripRect = strip.getBoundingClientRect();
    const thumbRect = activeThumb.getBoundingClientRect();
    const scrollTarget = activeThumb.offsetLeft - (stripRect.width / 2) + (thumbRect.width / 2);
    strip.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }
}

function viewerSlide(direction, newIndex) {
  if (_viewerSliding) return;
  _viewerSliding = true;
  const wrap = document.getElementById('viewerImageWrap');
  if (!wrap) { _viewerSliding = false; return; }

  const slideOut = direction === 'next' ? 'slide-left' : 'slide-right';
  const slideEnter = direction === 'next' ? 'slide-enter-left' : 'slide-enter-right';

  // Slide current image out
  wrap.classList.add(slideOut);

  setTimeout(() => {
    // Update index and image
    state.viewerIndex = newIndex;
    updateViewerImage();

    // Position new image off-screen on opposite side
    wrap.classList.remove(slideOut);
    wrap.classList.add(slideEnter);

    // Force reflow
    wrap.offsetHeight;

    // Slide new image in
    wrap.classList.remove(slideEnter);
    _viewerSliding = false;
  }, 300);
}

function viewerNext() {
  // Reset zoom before sliding
  const img = document.getElementById('viewerImage');
  if (img) { img.style.transition = 'none'; img.style.transform = ''; }
  const photos = activePhotos();
  const newIndex = (state.viewerIndex + 1) % photos.length;
  viewerSlide('next', newIndex);
}

function viewerPrev() {
  const img = document.getElementById('viewerImage');
  if (img) { img.style.transition = 'none'; img.style.transform = ''; }
  const photos = activePhotos();
  const newIndex = (state.viewerIndex - 1 + photos.length) % photos.length;
  viewerSlide('prev', newIndex);
}

function viewerGoTo(index) {
  if (index === state.viewerIndex) return;
  const direction = index > state.viewerIndex ? 'next' : 'prev';
  viewerSlide(direction, index);
}

// =========================================
// CART ACTIONS
// =========================================
function addToCart(pkg, photos) {
  state.cart.push({
    packageId: pkg.id,
    packageName: pkg.name,
    price: pkg.price,
    photos: [...photos],
  });
  updateTabBar();
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  render();
}

// =========================================
// FILTERS
// =========================================
let activeCat = 'all';
let activePrice = 'all';

function filterPackages() {
  const cards = document.querySelectorAll('.package-card');
  cards.forEach(card => {
    const cat = card.dataset.cat;
    const price = parseInt(card.dataset.price);
    let show = true;

    if (activeCat !== 'all' && cat !== activeCat) show = false;

    if (activePrice === 'under100' && price >= 100) show = false;
    if (activePrice === '100-250' && (price < 100 || price > 250)) show = false;
    if (activePrice === '250+' && price < 250) show = false;

    card.style.display = show ? '' : 'none';
  });
}

// =========================================
// EVENTS
// =========================================
function bindEvents() {
  // Tab bar (only main nav tabs, not selection tabs)
  document.querySelectorAll('.tab-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      navigate(tab);
    });
  });

  // Access submit → job selector
  document.getElementById('accessSubmit')?.addEventListener('click', () => {
    navigate('jobs');
  });

  // Job selector — pick a job
  document.querySelectorAll('[data-action="select-job"]').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.jobIndex);
      state.insideJob = true;
      navigate('gallery', { jobIndex: idx });
    });
  });

  // Gallery back → jobs
  document.querySelector('[data-action="back-to-jobs"]')?.addEventListener('click', () => {
    state.currentScreen = 'jobs';
    state.activeTab = 'jobs';
    state.insideJob = false;
    state.history = ['access'];
    render();
  });

  // Group photo tap → viewer (skip if tapping heart/star)
  document.querySelector('[data-action="view-group"]')?.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="like"]')) return;
    if (e.target.closest('[data-action="yb-pick"]')) return;
    const url = e.currentTarget.dataset.groupUrl;
    if (url) openGroupViewer(url);
  });

  // Photo grid tap → viewer, double-tap → like
  document.querySelectorAll('.photo-cell').forEach(cell => {
    let lastTap = 0;
    cell.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="like"]')) return;
      if (e.target.closest('[data-action="yb-pick"]')) return;
      const now = Date.now();
      if (now - lastTap < 350) {
        // Double-tap → like
        const index = parseInt(cell.dataset.photoIndex);
        const photo = activePhotos()[index];
        if (photo) {
          if (!state.liked.has(photo.id)) {
            state.liked.add(photo.id);
            const heartBtn = cell.querySelector('.photo-heart');
            if (heartBtn) heartBtn.classList.add('liked');
            // Update stats
            const favPill = document.querySelector('[data-action="show-favorites"]');
            if (favPill) {
              const count = state.liked.size;
              favPill.innerHTML = `${icons.heart} Favorites${count > 0 ? ` (${count})` : ''}`;
              favPill.classList.toggle('disabled', count === 0);
            }
            const statNum = document.querySelectorAll('.gallery-stat-num');
            if (statNum[1]) statNum[1].textContent = state.liked.size;
          }
          // Show heart burst animation
          const burst = document.createElement('div');
          burst.className = 'double-tap-heart';
          burst.innerHTML = icons.heart;
          cell.appendChild(burst);
          setTimeout(() => burst.remove(), 800);
        }
        lastTap = 0;
        return;
      }
      lastTap = now;
      // Single tap → open viewer after delay
      setTimeout(() => {
        if (lastTap === now) {
          const index = parseInt(cell.dataset.photoIndex);
          openViewer(index);
        }
      }, 350);
    });
  });

  // Heart on grid
  document.querySelectorAll('[data-action="like"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.photoId;
      if (state.liked.has(id)) state.liked.delete(id);
      else state.liked.add(id);
      btn.classList.toggle('liked', state.liked.has(id));
      // Update favorites count + pill in header
      const favPill = document.querySelector('[data-action="show-favorites"]');
      if (favPill) {
        const count = state.liked.size;
        favPill.innerHTML = `${icons.heart} Favorites${count > 0 ? ` (${count})` : ''}`;
        favPill.classList.toggle('disabled', count === 0);
      }
      const statNum = document.querySelectorAll('.gallery-stat-num');
      if (statNum[1]) statNum[1].textContent = state.liked.size;
    });
  });

  // Yearbook pick star
  document.querySelectorAll('[data-action="yb-pick"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.photoId;
      const idx = state.yearbookPicks.indexOf(id);
      const max = maxYearbookPicks();
      if (idx !== -1) {
        // Remove from picks
        state.yearbookPicks.splice(idx, 1);
      } else if (state.yearbookPicks.length < max) {
        // Add to picks
        state.yearbookPicks.push(id);
      } else {
        // Already have 2 — shake the button to indicate full
        btn.style.animation = 'none';
        btn.offsetHeight;
        btn.style.animation = 'ybShake 0.4s ease';
        return;
      }
      // Re-render to update picks bar + star badges
      render();
    });
  });

  // Yearbook remove from picks bar
  document.querySelectorAll('[data-action="yb-remove"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slot = parseInt(btn.dataset.slot);
      state.yearbookPicks.splice(slot, 1);
      render();
    });
  });

  // Viewer close — X button or tap empty space
  document.querySelector('[data-action="close-viewer"]')?.addEventListener('click', closeViewer);
  document.getElementById('photoViewer')?.addEventListener('click', e => {
    if (e.target.closest('button, img, .viewer-strip, .viewer-actions')) return;
    closeViewer();
  });

  // Viewer heart
  document.querySelector('[data-action="viewer-like"]')?.addEventListener('click', () => {
    const photo = activePhotos()[state.viewerIndex];
    if (!photo) return;
    if (state.liked.has(photo.id)) state.liked.delete(photo.id);
    else state.liked.add(photo.id);
    const heartBtn = document.getElementById('viewerHeart');
    heartBtn.classList.toggle('liked', state.liked.has(photo.id));
    // Update grid heart too
    const gridHeart = document.querySelector(`.photo-heart[data-photo-id="${photo.id}"]`);
    if (gridHeart) gridHeart.classList.toggle('liked', state.liked.has(photo.id));
  });

  // Viewer yearbook star pick
  document.querySelector('[data-action="viewer-yb-pick"]')?.addEventListener('click', () => {
    const photo = activePhotos()[state.viewerIndex];
    if (!photo) return;
    const idx = state.yearbookPicks.indexOf(photo.id);
    if (idx !== -1) {
      state.yearbookPicks.splice(idx, 1);
    } else {
      const max = maxYearbookPicks();
      if (state.yearbookPicks.length >= max) return; // full
      state.yearbookPicks.push(photo.id);
    }
    render();
    // Reopen viewer at same index
    openViewer(state.viewerIndex);
  });

  // Show favorites — scroll to first liked photo or just flash them
  document.querySelector('[data-action="show-favorites"]')?.addEventListener('click', () => {
    // Highlight liked photos in the grid
    const photos = activePhotos();
    document.querySelectorAll('.photo-cell').forEach(cell => {
      const idx = parseInt(cell.dataset.photoIndex);
      const photo = photos[idx];
      if (photo && state.liked.has(photo.id)) {
        cell.style.animation = 'none';
        cell.offsetHeight; // trigger reflow
        cell.style.animation = 'favFlash 0.6s ease';
      }
    });
  });

  // Gallery quick-add banner
  document.querySelector('[data-action="quick-add"]')?.addEventListener('click', () => {
    const digitalPkg = PACKAGES.find(p => p.id === 'pkg-001');
    if (digitalPkg) {
      addToCart(digitalPkg, activePhotos().map(p => p.id));
      const btn = document.querySelector('.quick-add-btn');
      if (btn) {
        btn.textContent = 'Added!';
        btn.style.background = 'var(--green)';
        setTimeout(() => { btn.textContent = 'Add to Cart'; btn.style.background = ''; }, 1500);
      }
    }
  });

  // Viewer navigation arrows
  document.querySelector('[data-action="viewer-prev"]')?.addEventListener('click', viewerPrev);
  document.querySelector('[data-action="viewer-next"]')?.addEventListener('click', viewerNext);

  // Viewer strip thumbnails
  document.querySelectorAll('[data-action="viewer-strip-goto"]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.stripIndex);
      viewerGoTo(index);
    });
  });

  // Viewer swipe + pinch-to-zoom + double-tap-to-zoom
  const viewerSlideContainer = document.getElementById('viewerSlideContainer');
  if (viewerSlideContainer) {
    let startX = 0, startY = 0;
    let scale = 1, lastScale = 1;
    let dragging = false, dragX = 0;
    let panX = 0, panY = 0, lastPanX = 0, lastPanY = 0;
    let pinching = false, startDist = 0;
    let lastTapTime = 0;

    const getImg = () => document.getElementById('viewerImage');
    const applyImgTransform = () => {
      const img = getImg();
      if (img) img.style.transform = `scale(${scale}) translate(${panX}px, ${panY}px)`;
    };
    const resetZoom = () => {
      scale = 1; lastScale = 1; panX = 0; panY = 0; lastPanX = 0; lastPanY = 0;
      const img = getImg();
      if (img) { img.style.transition = 'transform 0.25s ease'; img.style.transform = 'scale(1) translate(0,0)'; }
    };

    // === Mouse wheel / trackpad pinch zoom (desktop) ===
    viewerSlideContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const img = getImg();
      if (img) img.style.transition = 'none';
      // Trackpad pinch sends wheel with ctrlKey; also support regular scroll-zoom
      const delta = e.ctrlKey ? -e.deltaY * 0.01 : -e.deltaY * 0.003;
      scale = Math.min(4, Math.max(1, scale + delta));
      lastScale = scale;
      applyImgTransform();
      if (scale <= 1.05) { setTimeout(() => { if (scale <= 1.05) resetZoom(); }, 150); }
    }, { passive: false });

    // === Double-click to zoom (desktop) ===
    viewerSlideContainer.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const img = getImg();
      if (img) img.style.transition = 'transform 0.25s ease';
      if (scale > 1) { resetZoom(); }
      else { scale = 2.5; lastScale = scale; panX = 0; panY = 0; lastPanX = 0; lastPanY = 0; applyImgTransform(); }
    });

    // === Safari GestureEvent API (iOS) ===
    viewerSlideContainer.addEventListener('gesturestart', (e) => {
      e.preventDefault();
      pinching = true;
      dragging = false;
      lastScale = scale;
      const img = getImg();
      if (img) img.style.transition = 'none';
    });
    viewerSlideContainer.addEventListener('gesturechange', (e) => {
      e.preventDefault();
      scale = Math.min(4, Math.max(1, lastScale * e.scale));
      applyImgTransform();
    });
    viewerSlideContainer.addEventListener('gestureend', (e) => {
      e.preventDefault();
      pinching = false;
      lastScale = scale;
      if (scale <= 1.05) resetZoom();
    });

    // === Touch events for swipe, pan, pinch fallback, and double-tap ===
    viewerSlideContainer.addEventListener('touchstart', (e) => {
      const img = getImg();
      if (img) img.style.transition = 'none';
      if (e.touches.length === 2) {
        e.preventDefault();
        pinching = true;
        dragging = false;
        startDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        lastScale = scale;
      } else if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        if (!pinching) {
          dragging = true;
          dragX = 0;
          lastPanX = panX;
          lastPanY = panY;
        }
        const wrap = document.getElementById('viewerImageWrap');
        if (wrap && scale <= 1) wrap.style.transition = 'none';
      }
    }, { passive: false });

    viewerSlideContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        if (!pinching) {
          pinching = true; dragging = false;
          startDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          lastScale = scale;
        }
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        scale = Math.min(4, Math.max(1, lastScale * (dist / startDist)));
        applyImgTransform();
        dragging = false;
      } else if (e.touches.length === 1 && !pinching) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (scale > 1) {
          e.preventDefault();
          const maxPan = (scale - 1) * 150;
          panX = Math.min(maxPan, Math.max(-maxPan, lastPanX + dx / scale));
          panY = Math.min(maxPan, Math.max(-maxPan, lastPanY + dy / scale));
          applyImgTransform();
        } else if (dragging && !_viewerSliding) {
          dragX = dx;
          const wrap = document.getElementById('viewerImageWrap');
          if (wrap && Math.abs(dragX) > 10) {
            wrap.style.transform = `translateX(${dragX * 0.6}px)`;
            wrap.style.opacity = `${1 - Math.abs(dragX) / 600}`;
          }
        }
      }
    }, { passive: false });

    viewerSlideContainer.addEventListener('touchend', (e) => {
      if (pinching) {
        pinching = false;
        lastScale = scale;
        if (scale <= 1.05) resetZoom();
        return;
      }
      // Double-tap to zoom
      if (e.changedTouches.length === 1) {
        const dx = Math.abs(e.changedTouches[0].clientX - startX);
        const dy = Math.abs(e.changedTouches[0].clientY - startY);
        if (dx < 15 && dy < 15) {
          const now = Date.now();
          if (now - lastTapTime < 350) {
            lastTapTime = 0;
            e.preventDefault();
            const img = getImg();
            if (img) img.style.transition = 'transform 0.25s ease';
            if (scale > 1) { resetZoom(); }
            else { scale = 2.5; lastScale = scale; panX = 0; panY = 0; lastPanX = 0; lastPanY = 0; applyImgTransform(); }
            dragging = false;
            return;
          }
          lastTapTime = now;
        }
      }
      if (scale > 1) { lastPanX = panX; lastPanY = panY; dragging = false; return; }
      const wrap = document.getElementById('viewerImageWrap');
      if (dragging && e.changedTouches.length === 1) {
        const diffX = e.changedTouches[0].clientX - startX;
        const diffY = e.changedTouches[0].clientY - startY;
        if (wrap) { wrap.style.transition = ''; wrap.style.transform = ''; wrap.style.opacity = ''; }
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) viewerNext(); else viewerPrev();
        }
      } else if (wrap) { wrap.style.transition = ''; wrap.style.transform = ''; wrap.style.opacity = ''; }
      dragging = false;
    });
  }

  // Package cards → open sheet
  document.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.pkgId === 'pkg-007') { navigate('alacarte'); return; }
      openSheet(card.dataset.pkgId);
    });
  });

  // Sheet backdrop close
  document.getElementById('sheetBackdrop')?.addEventListener('click', closeSheet);

  // Sheet actions — use event delegation since sheet content is dynamic
  document.getElementById('bottomSheet')?.addEventListener('click', (e) => {
    const selectBtn = e.target.closest('[data-action="select-photos"]');
    if (selectBtn) {
      const pkg = PACKAGES.find(p => p.id === selectBtn.dataset.pkgId);
      closeSheet();
      setTimeout(() => navigate('selection', { package: pkg }), 200);
      return;
    }
    const quickAddBtn = e.target.closest('[data-action="quick-add-cart"]');
    if (quickAddBtn) {
      const pkg = PACKAGES.find(p => p.id === quickAddBtn.dataset.pkgId);
      if (pkg) {
        addToCart(pkg, activePhotos().slice(0, pkg.photoCount || activePhotos().length).map(p => p.id));
        closeSheet();
        setTimeout(() => navigate('cart'), 200);
      }
    }
  });

  // Category filters
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCat = pill.dataset.cat;
      filterPackages();
    });
  });

  // Price filters
  document.querySelectorAll('.price-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.price-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activePrice = pill.dataset.price;
      filterPackages();
    });
  });

  // À la carte bindings
  document.querySelector('[data-action="alc-back"]')?.addEventListener('click', goBack);
  document.querySelector('[data-action="alc-browse-packages"]')?.addEventListener('click', () => navigate('packages'));

  document.querySelectorAll('.alc-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.alaCarteFilter = tab.dataset.alcFilter;
      render();
    });
  });

  document.querySelectorAll('[data-alc-qty-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.alcQtyInc;
      state.alaCarteQty[id] = (state.alaCarteQty[id] || 1) + 1;
      render();
    });
  });

  document.querySelectorAll('[data-alc-qty-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.alcQtyDec;
      state.alaCarteQty[id] = Math.max(1, (state.alaCarteQty[id] || 1) - 1);
      render();
    });
  });

  document.querySelectorAll('.alc-size-select').forEach(sel => {
    sel.addEventListener('change', () => {
      state.alaCarteSize[sel.dataset.alcId] = sel.value;
    });
  });

  document.querySelectorAll('[data-alc-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = ALA_CARTE.find(p => p.id === btn.dataset.alcAdd);
      if (!product) return;
      const qty = state.alaCarteQty[product.id] || 1;
      const size = state.alaCarteSize[product.id] || product.defaultSize || '';
      // Add as cart item
      const cartItem = {
        id: `alc-${Date.now()}`,
        name: `${product.name}${size ? ' (' + size + ')' : ''}`,
        price: product.price,
        quantity: qty,
        photos: [activePhotos()[0]?.id],
        isAlaCarte: true,
      };
      state.cart.push(cartItem);
      // Brief feedback
      btn.textContent = '✓ Added!';
      btn.style.background = '#10b981';
      setTimeout(() => render(), 800);
    });
  });

  // Selection tab switching (Pose / Crop / Favorites)
  document.querySelectorAll('[data-action="sel-tab"]').forEach(tab => {
    tab.addEventListener('click', () => {
      const t = tab.dataset.tab;
      if (t === 'crop' && !state.selectionSlots[state.activeSlotIndex]?.photoId) return;
      state.selectionTab = t;
      render();
    });
  });

  // Slot-based photo selection — pick a pose for the active slot
  document.querySelectorAll('[data-action="pick-pose"]').forEach(cell => {
    cell.addEventListener('click', () => {
      const photoId = cell.dataset.photoId;
      const slot = state.selectionSlots[state.activeSlotIndex];
      if (!slot) return;
      if (slot.photoId === photoId) {
        // Deselect
        slot.photoId = null;
        state.selectedPhotos.delete(photoId);
        delete state.cropOffsets[state.activeSlotIndex];
        state.selectionTab = 'pose';
      } else {
        // Select new pose — stay on pose tab, user can switch to crop manually
        slot.photoId = photoId;
        state.selectedPhotos.add(photoId);
        state.cropOffsets[state.activeSlotIndex] = { tx: 0, ty: 0, scale: 1, confirmed: false };
      }
      render();
    });
  });

  // Confirm & Next — move to next slot, reset to pose tab
  document.querySelector('[data-action="next-slot"]')?.addEventListener('click', () => {
    if (state.activeSlotIndex < state.selectionSlots.length - 1) {
      state.activeSlotIndex++;
      state.selectionTab = 'pose';
      // Pre-init crop offset for next slot if it has a photo already
      const nextSlot = state.selectionSlots[state.activeSlotIndex];
      if (nextSlot?.photoId && !state.cropOffsets[state.activeSlotIndex]) {
        state.cropOffsets[state.activeSlotIndex] = { tx: 0, ty: 0, scale: 1, confirmed: false };
      }
      render();
    }
  });

  document.querySelector('[data-action="show-review"]')?.addEventListener('click', () => {
    state.showReview = true;
    render();
  });

  // Crop confirm
  document.querySelector('[data-action="crop-confirm"]')?.addEventListener('click', () => {
    const offset = state.cropOffsets[state.activeSlotIndex];
    if (offset) {
      offset.confirmed = true;
    } else {
      state.cropOffsets[state.activeSlotIndex] = { tx: 0, ty: 0, scale: 1, confirmed: true };
    }
    render();
  });

  // Go to crop (footer button when crop not yet confirmed)
  document.querySelector('[data-action="go-to-crop"]')?.addEventListener('click', () => {
    state.selectionTab = 'crop';
    render();
  });

  // Crop reset
  document.querySelector('[data-action="crop-reset"]')?.addEventListener('click', () => {
    const img = document.getElementById('selPreviewImg');
    if (img) { img.style.transition = 'transform 0.3s ease'; img.style.transform = 'translate(0,0) scale(1)'; }
    // Reset stored offset
    state.cropOffsets[state.activeSlotIndex] = { tx: 0, ty: 0, scale: 1, confirmed: false };
  });

  // Crop drag + pinch-to-zoom interaction
  const cropPreview = document.querySelector('.sel-preview-crop');
  if (cropPreview) {
    const img = cropPreview.querySelector('img');
    const existingOffset = state.cropOffsets[state.activeSlotIndex] || { tx: 0, ty: 0, scale: 1 };
    let dragging = false, startX = 0, startY = 0;
    let tx = existingOffset.tx, ty = existingOffset.ty;
    let scale = existingOffset.scale || 1;
    let lastTx = tx, lastTy = ty, lastScale = scale;
    let pinching = false, startDist = 0;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    // Calculate max pan based on how much the scaled image overflows the container
    const getMaxPan = () => {
      const rect = cropPreview.getBoundingClientRect();
      // At scale 1 with object-fit:cover, image fills container exactly
      // Panning is only allowed for the overflow from zooming
      const overflowX = rect.width * (scale - 1) / 2;
      const overflowY = rect.height * (scale - 1) / 2;
      return { maxX: overflowX, maxY: overflowY };
    };

    const clampPan = () => {
      const { maxX, maxY } = getMaxPan();
      tx = clamp(tx, -maxX, maxX);
      ty = clamp(ty, -maxY, maxY);
    };

    const applyTransform = () => {
      clampPan();
      if (img) img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    };

    // Apply existing offset on load
    if (img && (tx !== 0 || ty !== 0 || scale !== 1)) {
      applyTransform();
    }

    const saveOffset = () => {
      const offset = state.cropOffsets[state.activeSlotIndex];
      if (offset) { offset.tx = tx; offset.ty = ty; offset.scale = scale; }
    };

    const onStart = (x, y) => { dragging = true; startX = x; startY = y; if (img) img.style.transition = 'none'; };
    const onMove = (x, y) => {
      if (!dragging || pinching) return;
      tx = lastTx + (x - startX);
      ty = lastTy + (y - startY);
      applyTransform();
    };
    const onEnd = () => {
      dragging = false;
      lastTx = tx; lastTy = ty;
      saveOffset();
    };

    // Mouse events
    cropPreview.addEventListener('mousedown', e => { e.preventDefault(); onStart(e.clientX, e.clientY); });
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    // Mouse wheel / trackpad pinch zoom
    cropPreview.addEventListener('wheel', e => {
      e.preventDefault();
      if (img) img.style.transition = 'none';
      const delta = e.ctrlKey ? -e.deltaY * 0.01 : -e.deltaY * 0.003;
      scale = clamp(scale + delta, 1, 3);
      lastScale = scale;
      applyTransform();
      lastTx = tx; lastTy = ty;
      saveOffset();
    }, { passive: false });

    // Touch events — single finger pan, two finger pinch-to-zoom
    cropPreview.addEventListener('touchstart', e => {
      e.preventDefault();
      if (e.touches.length === 2) {
        pinching = true;
        dragging = false;
        startDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        lastScale = scale;
        if (img) img.style.transition = 'none';
      } else if (e.touches.length === 1) {
        pinching = false;
        const t = e.touches[0];
        onStart(t.clientX, t.clientY);
      }
    }, { passive: false });

    cropPreview.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 2 && pinching) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        scale = clamp(lastScale * (dist / startDist), 1, 3);
        applyTransform();
        lastTx = tx; lastTy = ty;
      } else if (e.touches.length === 1 && !pinching) {
        const t = e.touches[0];
        onMove(t.clientX, t.clientY);
      }
    }, { passive: false });

    cropPreview.addEventListener('touchend', e => {
      if (pinching) {
        pinching = false;
        lastScale = scale;
        saveOffset();
        return;
      }
      onEnd();
    });
  }

  // Selection back
  document.querySelector('[data-action="back-from-selection"]')?.addEventListener('click', goBack);

  // Review: swap a slot — go back to picking mode for that slot
  document.querySelectorAll('[data-action="swap-slot"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeSlotIndex = parseInt(btn.dataset.slotIndex);
      state.showReview = false;
      render();
    });
  });

  // Review: back button — return to picking mode for last slot
  document.querySelector('[data-action="back-from-review"]')?.addEventListener('click', () => {
    state.showReview = false;
    render();
  });

  // Jump to a specific slot from mini-strip
  document.querySelectorAll('[data-action="jump-slot"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeSlotIndex = parseInt(btn.dataset.slotIndex);
      state.showReview = false;
      render();
    });
  });

  // Compare — removed from slot-based flow (compare lives in gallery viewer now)
  document.querySelector('[data-action="close-compare"]')?.addEventListener('click', () => {
    document.getElementById('compareOverlay')?.classList.remove('open');
  });

  // Add to cart from selection — uses slot-based photos
  document.querySelector('[data-action="add-to-cart"]')?.addEventListener('click', () => {
    if (state.selectingPackage && state.selectionSlots.some(s => s.photoId)) {
      const photos = state.selectionSlots.filter(s => s.photoId).map(s => s.photoId);
      addToCart(state.selectingPackage, photos);
      state.selectedPhotos.clear();
      state.selectionSlots = [];
      state.selectingPackage = null;
      state.showReview = false;
      navigate('cart');
    }
  });

  // Cart actions
  document.querySelectorAll('[data-remove-cart]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.removeCart)));
  });

  document.querySelector('[data-action="upsell"]')?.addEventListener('click', () => {
    state.cart.push({
      packageId: 'upsell-wallet',
      packageName: 'Wallet Prints Add-on',
      price: 15,
      photos: [activePhotos()[0].id],
    });
    render();
  });

  document.querySelector('[data-action="add-student"]')?.addEventListener('click', () => {
    navigate('access');
  });

  document.querySelector('[data-action="checkout"]')?.addEventListener('click', () => {
    navigate('checkout');
  });

  // Checkout
  document.querySelector('[data-action="back-from-checkout"]')?.addEventListener('click', goBack);

  document.querySelectorAll('[data-action="place-order"]').forEach(btn => {
    btn.addEventListener('click', showSuccess);
  });

  document.querySelector('[data-action="toggle-gift"]')?.addEventListener('click', () => {
    state.giftMode = !state.giftMode;
    render();
  });

  // Sign out
  document.querySelector('[data-action="signout"]')?.addEventListener('click', () => {
    state.cart = [];
    state.liked.clear();
    state.selectedPhotos.clear();
    state.history = [];
    navigate('access');
  });
}

// =========================================
// SUCCESS
// =========================================
function showSuccess() {
  const overlay = document.getElementById('successOverlay');
  overlay.classList.add('open');

  // Confetti
  const colors = ['#e85d04', '#f4845f', '#10b981', '#6366f1', '#f59e0b', '#ec4899'];
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.top = (30 + Math.random() * 30) + '%';
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    dot.style.animationDelay = Math.random() * 0.5 + 's';
    dot.style.width = (6 + Math.random() * 6) + 'px';
    dot.style.height = dot.style.width;
    overlay.appendChild(dot);
  }

  setTimeout(() => {
    overlay.classList.remove('open');
    overlay.querySelectorAll('.confetti-dot').forEach(d => d.remove());
    state.cart = [];
    navigate('gallery');
  }, 2500);
}

// =========================================
// INIT
// =========================================
render();
