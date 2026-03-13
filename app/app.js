import {
  PHOTOGRAPHER, GOTPHOTO_DEFAULTS, JOBS, STUDENTS, CATEGORIES, PACKAGES, PHOTOS,
  GALLERY_JOBS, getPhotoUrl, getPhotoThumb, getGroupPhotoUrl, CLIENT_ACCOUNTS
} from '../data/mock.js';

import { TEMPLATES, PACKAGE_TEMPLATES, getTemplatesForPackage } from '../templates/template-definitions.js';
import { renderTemplate, renderThumbnail } from '../templates/template-renderer.js';

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

function render() {
  app.innerHTML = '';
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
  return `
    <div class="screen ${isActive ? 'active' : ''}" data-screen="access">
      <div class="access-screen">
        ${logoSrc
          ? `<img src="${logoSrc}" alt="${PHOTOGRAPHER.business}" class="access-biz-logo">`
          : `<div class="access-logo">Choice<span class="logo-accent">Pix</span></div>
             <div class="access-tagline">Photography</div>`
        }
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
        ${PHOTOGRAPHER.logo
          ? `<img src="${PHOTOGRAPHER.logo}" alt="${PHOTOGRAPHER.business}" class="job-selector-logo-img">`
          : `<div class="job-selector-logo">Choice<span class="logo-accent">Pix</span></div>`
        }
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
  const allFilled = filledCount === totalSlots;

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

  // Favorites section
  let favoritesHtml = '';
  if (likedPhotos.length > 0) {
    favoritesHtml = `
      <div class="pick-section">
        <div class="pick-section-title">${icons.heart} Your Favorites</div>
        <div class="pose-grid-v2">${likedPhotos.map(buildPhotoCell).join('')}</div>
      </div>
    `;
  }

  // All photos section
  const allPhotosLabel = likedPhotos.length > 0 ? 'All Photos' : 'Choose a Photo';
  const photosToShow = likedPhotos.length > 0 ? otherPhotos : photos;
  const allPhotosHtml = `
    <div class="pick-section">
      <div class="pick-section-title">${allPhotosLabel}</div>
      <div class="pose-grid-v2">${photosToShow.map(buildPhotoCell).join('')}</div>
    </div>
  `;

  // Filled slots mini-strip at bottom (shows what's been picked so far)
  const filledSlots = slots.filter(s => s.photoId);
  let miniStripHtml = '';
  if (filledSlots.length > 0) {
    const miniItems = slots.map((s, i) => {
      if (!s.photoId) return `<div class="mini-slot mini-slot-empty" data-action="jump-slot" data-slot-index="${i}"><span>${i + 1}</span></div>`;
      const photo = photos.find(p => p.id === s.photoId);
      const isCurrent = i === state.activeSlotIndex;
      return `
        <div class="mini-slot ${isCurrent ? 'mini-slot-current' : ''}" data-action="jump-slot" data-slot-index="${i}">
          <img src="${getPhotoThumb(photo.file)}" alt="${photo.label}">
        </div>`;
    }).join('');
    miniStripHtml = `<div class="mini-strip">${miniItems}</div>`;
  }

  return `
    <div class="screen ${isActive ? 'active' : ''}" data-screen="selection">
      <div class="selection-header">
        <button class="selection-back" data-action="back-from-selection">
          ${icons.back} Back
        </button>
        <div class="selection-title">${pkg ? pkg.name : 'Select Photos'}</div>
        <div class="selection-progress-bar">
          <div class="selection-progress-fill" style="width: ${totalSlots > 0 ? (filledCount / totalSlots * 100) : 0}%"></div>
        </div>
      </div>

      <div class="pick-prompt">
        <div class="pick-prompt-step">Photo ${state.activeSlotIndex + 1} of ${totalSlots}</div>
        <div class="pick-prompt-item">${activeSlot ? activeSlot.label : ''}</div>
        ${activePhoto ? `<div class="pick-prompt-selected">Selected: ${activePhoto.label} — tap another to change</div>` : ''}
      </div>

      <div class="selection-body">
        ${favoritesHtml}
        ${allPhotosHtml}
      </div>

      <div class="selection-footer">
        ${state.activeSlotIndex > 0 ? `<button class="btn-slot-nav" data-action="prev-slot">${icons.back}</button>` : '<div></div>'}
        ${miniStripHtml}
        <div></div>
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
  const hidden = state.currentScreen === 'access' || state.currentScreen === 'jobs' || state.currentScreen === 'selection' || state.currentScreen === 'checkout';
  const tabs = [
    { id: 'gallery', label: 'Gallery', icon: icons.gallery },
    { id: 'packages', label: 'Packages', icon: icons.packages },
    { id: 'cart', label: 'Cart', icon: icons.cart },
    { id: 'account', label: 'Account', icon: icons.account },
  ];

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
  const photo = activePhotos()[state.viewerIndex];
  const isLiked = photo ? state.liked.has(photo.id) : false;
  const isYB = isYearbookJob();
  const isYbPicked = isYB && photo ? state.yearbookPicks.includes(photo.id) : false;
  const ybPickIndex = isYB && photo ? state.yearbookPicks.indexOf(photo.id) : -1;
  el.innerHTML = `
    <div class="viewer-counter" id="viewerCounter">${state.viewerIndex + 1} / ${activePhotos().length}</div>
    <button class="viewer-close" data-action="close-viewer">${icons.close}</button>
    <div class="viewer-image-wrap" id="viewerImageWrap">
      <img id="viewerImage" src="${photo ? getPhotoUrl(photo.file) : ''}" alt="">
    </div>
    <div class="viewer-actions">
      <button class="viewer-heart-btn ${isLiked ? 'liked' : ''}" id="viewerHeart" data-action="viewer-like">${icons.heart}</button>
      ${isYB ? `<button class="viewer-star-btn ${isYbPicked ? 'picked' : ''}" id="viewerStar" data-action="viewer-yb-pick">
        ${icons.star}
        ${isYbPicked && maxYearbookPicks() > 1 ? `<span class="viewer-star-num">${ybPickIndex + 1}</span>` : ''}
      </button>` : ''}
    </div>
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
        ${sheetTemplates.map(tmpl => `
          <div class="sheet-template-item">
            <div class="sheet-template-render">${renderTemplate(tmpl.id, samplePhotoUrl, 100)}</div>
            <div class="sheet-template-name">${tmpl.name}</div>
          </div>
        `).join('')}
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

  if (['gallery', 'packages', 'cart', 'account'].includes(screen)) {
    state.activeTab = screen;
  }

  if (params.package) {
    state.selectingPackage = params.package;
    state.selectedPhotos.clear();
    state.activeTemplateIndex = 0;
    state.selectionSlots = buildSlotsForPackage(params.package);
    state.activeSlotIndex = 0;
    state.showReview = false;
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
    if (['gallery', 'packages', 'cart', 'account'].includes(state.currentScreen)) {
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
  if (img) img.src = url;
  if (counter) counter.style.display = 'none';
  if (heartBtn) heartBtn.style.display = 'none';
  viewer.classList.add('open');
}

function closeViewer() {
  const viewer = document.getElementById('photoViewer');
  viewer?.classList.remove('open');
  if (state.viewerGroupMode) {
    const counter = document.getElementById('viewerCounter');
    const heartBtn = document.getElementById('viewerHeart');
    if (counter) counter.style.display = '';
    if (heartBtn) heartBtn.style.display = '';
    state.viewerGroupMode = false;
  }
}

function updateViewerImage() {
  const photos = activePhotos();
  const gj = activeGalleryJob();
  const photo = photos[state.viewerIndex];
  if (!photo) return;
  const img = document.getElementById('viewerImage');
  const counter = document.getElementById('viewerCounter');
  const heartBtn = document.getElementById('viewerHeart');
  if (img) img.src = getPhotoUrl(photo.file, gj);
  if (counter) counter.textContent = `${state.viewerIndex + 1} / ${photos.length}`;
  if (heartBtn) heartBtn.classList.toggle('liked', state.liked.has(photo.id));
}

function viewerNext() {
  const photos = activePhotos();
  state.viewerIndex = (state.viewerIndex + 1) % photos.length;
  updateViewerImage();
}

function viewerPrev() {
  const photos = activePhotos();
  state.viewerIndex = (state.viewerIndex - 1 + photos.length) % photos.length;
  updateViewerImage();
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
  // Tab bar
  document.querySelectorAll('[data-tab]').forEach(btn => {
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
      navigate('gallery', { jobIndex: idx });
    });
  });

  // Gallery back → jobs
  document.querySelector('[data-action="back-to-jobs"]')?.addEventListener('click', () => {
    state.currentScreen = 'jobs';
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

  // Viewer close
  document.querySelector('[data-action="close-viewer"]')?.addEventListener('click', closeViewer);

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

  // Viewer swipe
  const viewerWrap = document.getElementById('viewerImageWrap');
  if (viewerWrap) {
    let startX = 0;
    let startY = 0;
    let scale = 1;
    let startDist = 0;

    viewerWrap.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        startDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      } else {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    viewerWrap.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        scale = Math.min(3, Math.max(1, dist / startDist));
        const img = document.getElementById('viewerImage');
        if (img) img.style.transform = `scale(${scale})`;
      }
    }, { passive: true });

    viewerWrap.addEventListener('touchend', (e) => {
      if (scale > 1) {
        scale = 1;
        const img = document.getElementById('viewerImage');
        if (img) img.style.transform = 'scale(1)';
        return;
      }
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) viewerNext();
          else viewerPrev();
        }
      }
    });
  }

  // Package cards → open sheet
  document.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', () => openSheet(card.dataset.pkgId));
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

  // Slot-based photo selection — pick a pose for the active slot, auto-advance
  document.querySelectorAll('[data-action="pick-pose"]').forEach(cell => {
    cell.addEventListener('click', () => {
      const photoId = cell.dataset.photoId;
      const slot = state.selectionSlots[state.activeSlotIndex];
      if (!slot) return;
      // Toggle: if same photo, deselect; otherwise assign
      if (slot.photoId === photoId) {
        slot.photoId = null;
        state.selectedPhotos.delete(photoId);
        render();
      } else {
        slot.photoId = photoId;
        state.selectedPhotos.add(photoId);
        render();
        // Auto-advance after brief delay
        setTimeout(() => {
          const allFilled = state.selectionSlots.every(s => s.photoId);
          if (allFilled) {
            state.showReview = true;
            render();
          } else if (state.activeSlotIndex < state.selectionSlots.length - 1) {
            state.activeSlotIndex++;
            render();
          }
        }, 500);
      }
    });
  });

  // Prev slot navigation
  document.querySelector('[data-action="prev-slot"]')?.addEventListener('click', () => {
    if (state.activeSlotIndex > 0) {
      state.activeSlotIndex--;
      render();
    }
  });

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
