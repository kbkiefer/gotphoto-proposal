import {
  PHOTOGRAPHER, JOBS, STUDENTS, CATEGORIES, PACKAGES, PHOTOS,
  getPhotoUrl, getPhotoThumb, ORDERS, ANALYTICS, CAMPAIGNS,
  AI_SUBJECT_LINES, NOTIFICATIONS,
  GALLERY_JOBS, GOTPHOTO_DEFAULTS, getGroupPhotoUrl, CLIENT_ACCOUNTS,
  CUSTOMER_ORDERS, CUSTOMER_REQUESTS, BATCH_SHIPPING,
  CONTACTS, ORGANIZATIONS, MONTHLY_STATS, VOUCHERS, JOB_FUNNELS
} from '../data/mock.js';

// ─── State ──────────────────────────────────────────────
let currentPage = 'dashboard';
let expandedPkgId = null;
let pkgState = JSON.parse(JSON.stringify(PACKAGES));
let notificationsOpen = false;
let selectedAiSubject = null;
let expandedCampaignId = null;
let sidebarOpen = false;
let ordersTab = 'orders';
let contactsTab = 'buyers';

// ─── Navigation ─────────────────────────────────────────
const SVG = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  jobs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  packages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
  campaigns: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  revenue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  gallery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  conversion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  trendUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  trendDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
  drag: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  hamburger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  account: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
};
const NAV_ITEMS = [
  { id: 'dashboard',  icon: SVG.dashboard, label: 'Dashboard' },
  { id: 'jobs',       icon: SVG.jobs, label: 'Jobs' },
  { id: 'orders',     icon: SVG.orders, label: 'Orders' },
  { id: 'packages',   icon: SVG.packages, label: 'Packages' },
  { id: 'contacts',   icon: SVG.account, label: 'Contacts' },
  { id: 'analytics',  icon: SVG.analytics, label: 'Analytics' },
  { id: 'campaigns',  icon: SVG.campaigns, label: 'Campaigns' },
  { id: 'settings',   icon: SVG.settings, label: 'Settings' },
];

function toggleSidebar(open) {
  sidebarOpen = typeof open === 'boolean' ? open : !sidebarOpen;
  document.getElementById('sidebar').classList.toggle('open', sidebarOpen);
  document.getElementById('sidebarOverlay').classList.toggle('open', sidebarOpen);
}

function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = NAV_ITEMS.map(item => `
    <div class="nav-item ${item.id === currentPage ? 'active' : ''}" data-page="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </div>
  `).join('');

  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      navigate(el.dataset.page);
      toggleSidebar(false);
    });
  });

  document.getElementById('sidebarOverlay').addEventListener('click', () => toggleSidebar(false));
}

function buildTopbar(title) {
  const topbar = document.getElementById('topbar');
  const unread = NOTIFICATIONS.filter(n => !n.read).length;
  topbar.innerHTML = `
    <button class="hamburger-btn" id="hamburgerBtn">${SVG.hamburger}</button>
    <h1 class="topbar-title">${title}</h1>
    <div class="topbar-search">
      <span class="search-icon">${SVG.search}</span>
      <input type="text" placeholder="Search...">
    </div>
    <div class="topbar-bell notif-bell" id="bellBtn">
      ${SVG.bell}
      ${unread > 0 ? `<span class="bell-badge">${unread}</span>` : ''}
      <div class="notification-dropdown ${notificationsOpen ? 'open' : ''}" id="notifDropdown">
        <div class="notification-dropdown-header">Notifications</div>
        ${NOTIFICATIONS.map(n => `
          <div class="notification-item ${n.read ? '' : 'unread'}">
            <div class="notification-text">${n.text}</div>
            <div class="notification-time">${n.time}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="avatar-circle avatar-xs">BK</div>
  `;

  document.getElementById('hamburgerBtn').addEventListener('click', () => toggleSidebar());

  document.getElementById('bellBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    notificationsOpen = !notificationsOpen;
    document.getElementById('notifDropdown').classList.toggle('open', notificationsOpen);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notif-bell')) {
      notificationsOpen = false;
      const dd = document.getElementById('notifDropdown');
      if (dd) dd.classList.remove('open');
    }
  });
}

function navigate(page, detail) {
  currentPage = page;
  notificationsOpen = false;
  buildSidebar();

  const content = document.getElementById('pageContent');
  content.style.animation = 'none';
  content.offsetHeight;
  content.style.animation = '';

  const titles = {
    dashboard: 'Dashboard',
    jobs: 'Jobs',
    jobDetail: 'Job Detail',
    orders: 'Orders',
    packages: 'Package Manager',
    contacts: 'Contacts',
    analytics: 'Analytics',
    campaigns: 'Campaigns',
    settings: 'Settings'
  };
  buildTopbar(titles[page] || 'Dashboard');

  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'jobs': renderJobs(); break;
    case 'jobDetail': renderJobDetail(detail); break;
    case 'orders': renderOrders(); break;
    case 'packages': renderPackages(); break;
    case 'contacts': renderContacts(); break;
    case 'analytics': renderAnalytics(); break;
    case 'campaigns': renderCampaigns(); break;
    case 'settings': renderSettings(); break;
  }
}

// ─── Count-Up Animation ─────────────────────────────────
function animateCount(el, target, prefix = '', suffix = '') {
  const duration = 1000;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = Math.round(ease * target);
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ─── SVG Chart Helpers ──────────────────────────────────
function lineChart(data, width, height, { xKey, yKey, fill = true, animate = true } = {}) {
  const pad = { top: 20, right: 20, bottom: 36, left: 10 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const vals = data.map(d => typeof d === 'number' ? d : d[yKey]);
  const labels = data.map(d => typeof d === 'object' ? d[xKey] : '');
  const max = Math.max(...vals) * 1.15;
  const min = 0;

  const points = vals.map((v, i) => ({
    x: pad.left + (i / (vals.length - 1)) * w,
    y: pad.top + h - ((v - min) / (max - min)) * h
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = pathD + ` L${points[points.length - 1].x},${pad.top + h} L${points[0].x},${pad.top + h} Z`;

  const pathLen = estimatePathLength(points);
  const id = 'grad-' + Math.random().toString(36).slice(2, 8);

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.2"/>
    <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.01"/>
  </linearGradient></defs>`;

  if (fill) {
    svg += `<path d="${areaD}" fill="url(#${id})" />`;
  }

  if (animate) {
    svg += `<path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-draw-in" style="--length:${pathLen}"/>`;
  } else {
    svg += `<path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  points.forEach(p => {
    svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--accent)" stroke="#fff" stroke-width="2"/>`;
  });

  if (labels.length && labels[0]) {
    labels.forEach((l, i) => {
      svg += `<text x="${points[i].x}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#6b7280" font-family="inherit">${l}</text>`;
    });
  }

  svg += '</svg>';
  return svg;
}

function smoothLineChart(data, width, height) {
  const pad = { top: 24, right: 20, bottom: 16, left: 50 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(...data) * 1.15;

  const points = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1)) * w,
    y: pad.top + h - (v / max) * h
  }));

  let pathD = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cx = (points[i].x + points[i + 1].x) / 2;
    pathD += ` C${cx},${points[i].y} ${cx},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
  }

  const areaD = pathD + ` L${points[points.length - 1].x},${pad.top + h} L${points[0].x},${pad.top + h} Z`;
  const pathLen = estimatePathLength(points) * 1.3;
  const id = 'sgrad-' + Math.random().toString(36).slice(2, 8);

  const yTicks = 5;
  let yAxis = '';
  for (let i = 0; i <= yTicks; i++) {
    const val = Math.round((max / yTicks) * i);
    const y = pad.top + h - (i / yTicks) * h;
    yAxis += `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#9ca3af" font-family="inherit">$${(val / 1000).toFixed(1)}k</text>`;
    yAxis += `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/>`;
  }

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.01"/>
  </linearGradient></defs>`;
  svg += yAxis;
  svg += `<path d="${areaD}" fill="url(#${id})" />`;
  svg += `<path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-draw-in" style="--length:${pathLen}"/>`;
  svg += '</svg>';
  return svg;
}

function dualLineChart(data, width, height) {
  const pad = { top: 12, right: 20, bottom: 40, left: 10 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const allVals = data.flatMap(d => [d.revenue, d.cost]);
  const max = Math.max(...allVals) * 1.2;

  function smoothPath(vals) {
    const pts = vals.map((v, i) => ({
      x: pad.left + (i / (vals.length - 1)) * w,
      y: pad.top + h - (v / max) * h
    }));
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2;
      d += ` C${cx},${pts[i].y} ${cx},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
    }
    return { d, pts };
  }

  const rev = smoothPath(data.map(d => d.revenue));
  const cost = smoothPath(data.map(d => d.cost));
  const revLen = estimatePathLength(rev.pts) * 1.3;
  const costLen = estimatePathLength(cost.pts) * 1.3;

  const revGrad = 'rg-' + Math.random().toString(36).slice(2, 8);

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs><linearGradient id="${revGrad}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3b5bdb" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#3b5bdb" stop-opacity="0.01"/>
  </linearGradient></defs>`;

  // Revenue fill
  const areaD = rev.d + ` L${rev.pts[rev.pts.length - 1].x},${pad.top + h} L${rev.pts[0].x},${pad.top + h} Z`;
  svg += `<path d="${areaD}" fill="url(#${revGrad})" />`;

  // Revenue line (blue)
  svg += `<path d="${rev.d}" fill="none" stroke="#3b5bdb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-draw-in" style="--length:${revLen}"/>`;

  // Cost line (orange)
  svg += `<path d="${cost.d}" fill="none" stroke="#e8890c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-draw-in" style="--length:${costLen}"/>`;

  // Date labels
  data.forEach((d, i) => {
    const x = pad.left + (i / (data.length - 1)) * w;
    svg += `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#9ca3af" font-family="inherit">${d.date}</text>`;
  });

  svg += '</svg>';
  return svg;
}

function horizontalBarChart(data, width, height) {
  const pad = { top: 8, right: 80, bottom: 8, left: 180 };
  const barH = 28;
  const gap = 12;
  const totalH = data.length * (barH + gap);
  const maxVal = Math.max(...data.map(d => d.revenue));
  const barW = width - pad.left - pad.right;

  let svg = `<svg viewBox="0 0 ${width} ${totalH + 16}" xmlns="http://www.w3.org/2000/svg">`;
  data.forEach((d, i) => {
    const y = i * (barH + gap) + 8;
    const w = (d.revenue / maxVal) * barW;
    svg += `<text x="${pad.left - 12}" y="${y + barH / 2 + 4}" text-anchor="end" font-size="12" fill="#374151" font-weight="500" font-family="inherit">${d.name}</text>`;
    svg += `<rect x="${pad.left}" y="${y}" width="${w}" height="${barH}" rx="4" fill="var(--accent)" opacity="0.85" class="bar-animate" style="animation-delay:${i * 0.1}s"/>`;
    svg += `<text x="${pad.left + w + 8}" y="${y + barH / 2 + 4}" font-size="12" fill="#6b7280" font-weight="600" font-family="inherit">$${d.revenue.toLocaleString()}</text>`;
  });
  svg += '</svg>';
  return svg;
}

function verticalBarChart(data, width, height) {
  const pad = { top: 16, right: 16, bottom: 40, left: 16 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map(d => d.count)) * 1.15;
  const barW = Math.min(40, (w / data.length) - 12);
  const gap = (w - barW * data.length) / (data.length + 1);

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  data.forEach((d, i) => {
    const x = pad.left + gap + i * (barW + gap);
    const barH = (d.count / maxVal) * h;
    const y = pad.top + h - barH;
    svg += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="var(--accent)" opacity="0.85" class="bar-animate-v" style="animation-delay:${i * 0.08}s"/>`;
    svg += `<text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#6b7280" font-weight="600" font-family="inherit">${d.count}</text>`;
    svg += `<text x="${x + barW / 2}" y="${height - 10}" text-anchor="middle" font-size="10" fill="#9ca3af" font-family="inherit">${d.label}</text>`;
  });
  svg += '</svg>';
  return svg;
}

function estimatePathLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return Math.round(len);
}

// ─── Page: Dashboard ────────────────────────────────────
function renderDashboard() {
  const el = document.getElementById('pageContent');
  const totalRevenue = GALLERY_JOBS.reduce((s, j) => s + (j.revenue || 0), 0);
  const totalOrders = GALLERY_JOBS.reduce((s, j) => s + (j.orderCount || 0), 0);
  const totalSubjects = GALLERY_JOBS.reduce((s, j) => s + (j.subjectCount || 0), 0);
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';
  const loginRate = 87.5;
  const orderRate = totalSubjects > 0 ? ((totalOrders / totalSubjects) * 100).toFixed(1) : '0';
  const sellingCount = GALLERY_JOBS.filter(j => j.status === 'active').length;
  const archivedCount = GALLERY_JOBS.filter(j => j.status === 'archived').length;
  const dailyData = ANALYTICS.revenue.daily;
  const weeklyTotal = dailyData.reduce((s, d) => s + d.revenue, 0);

  el.innerHTML = `
    <!-- Revenue Chart Card -->
    <div class="gp-card section-gap">
      <div class="gp-card-header">
        <div>
          <div class="gp-card-label">Revenue last 7 days</div>
          <div class="gp-card-big-value">$${weeklyTotal.toLocaleString()}</div>
        </div>
        <span class="gp-trend ${ANALYTICS.revenue.weeklyTrend < 0 ? 'down' : 'up'}">${ANALYTICS.revenue.weeklyTrend > 0 ? '+' : ''}${ANALYTICS.revenue.weeklyTrend}%</span>
      </div>
      <div class="chart-container" style="padding:0 20px">
        ${dualLineChart(dailyData, 660, 180)}
      </div>
      <div class="gp-chart-legend">
        <span class="gp-legend-item"><span class="gp-legend-dot" style="background:#3b5bdb"></span> Revenue</span>
        <span class="gp-legend-item"><span class="gp-legend-dot" style="background:#e8890c"></span> Cost</span>
      </div>
      <div class="gp-card-footer">
        <div class="gp-card-footer-left">Last 7 days</div>
        <a class="gp-card-footer-link">Revenue statistics &rarr;</a>
      </div>
    </div>

    <!-- Stats 2x2 Card -->
    <div class="gp-card section-gap">
      <div class="gp-stats-grid">
        <div class="gp-stat">
          <div class="gp-stat-label">Orders</div>
          <div class="gp-stat-row">
            <span class="gp-stat-value">${totalOrders}</span>
            <span class="gp-trend down">-${ANALYTICS.orders.trend}%</span>
          </div>
        </div>
        <div class="gp-stat">
          <div class="gp-stat-label">Average order value</div>
          <div class="gp-stat-row">
            <span class="gp-stat-value">$${avgOrderValue}</span>
            <span class="gp-trend up">+10.82%</span>
          </div>
        </div>
        <div class="gp-stat">
          <div class="gp-stat-label">Login Rate</div>
          <div class="gp-stat-value">${loginRate}%</div>
          <div class="gp-progress"><div class="gp-progress-fill" style="width:${loginRate}%"></div></div>
        </div>
        <div class="gp-stat">
          <div class="gp-stat-label">Order Rate</div>
          <div class="gp-stat-value">${orderRate}%</div>
          <div class="gp-progress"><div class="gp-progress-fill" style="width:${Math.min(parseFloat(orderRate) * 5, 100)}%"></div></div>
        </div>
      </div>
      <div class="gp-card-footer">
        <div class="gp-card-footer-left">Last 7 days</div>
        <a class="gp-card-footer-link">Job statistics &rarr;</a>
      </div>
    </div>

    <!-- Latest Jobs -->
    <div class="gp-section-title">Latest jobs</div>
    <div class="gp-card section-gap">
      <div class="gp-tabs" id="dashJobTabs">
        <span class="gp-tab active" data-filter="active">Selling <span class="gp-tab-count">${sellingCount}</span></span>
        <span class="gp-tab" data-filter="archived">Archived <span class="gp-tab-count">${archivedCount}</span></span>
      </div>
      <div class="gp-jobs-table" id="dashJobsTable">
        <div class="gp-jobs-header-row">
          <div class="gp-jobs-col-name">Photo job name</div>
          <div class="gp-jobs-col">Activated</div>
          <div class="gp-jobs-col">Login rate</div>
          <div class="gp-jobs-col">Order rate</div>
          <div class="gp-jobs-col">Revenue</div>
          <div class="gp-jobs-col">Actions</div>
        </div>
        ${GALLERY_JOBS.filter(gj => gj.status === 'active').map(gj => {
          const loginR = Math.round(70 + Math.random() * 30);
          const orderR = ((gj.orderCount || 0) / (gj.subjectCount || 1) * 100).toFixed(0);
          return `
            <div class="gp-jobs-row" data-job-dash="${gj.id}" data-job-status="${gj.status}">
              <div class="gp-jobs-col-name">
                <div class="gp-jobs-icon">${SVG.camera}</div>
                <div>
                  <div class="gp-jobs-name">${gj.name}</div>
                  <div class="gp-jobs-school">${gj.school || gj.type}</div>
                </div>
              </div>
              <div class="gp-jobs-col">
                <div class="gp-jobs-date">${gj.createdDate ? formatDate(gj.createdDate).split(',')[0] : ''}</div>
              </div>
              <div class="gp-jobs-col">${loginR}%</div>
              <div class="gp-jobs-col">${orderR}%</div>
              <div class="gp-jobs-col gp-jobs-revenue">$${(gj.revenue || 0).toLocaleString()}</div>
              <div class="gp-jobs-col"><a class="gp-jobs-action">Open</a></div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="gp-card-footer">
        <div></div>
        <a class="gp-card-footer-link" id="viewAllJobs">View all jobs &rarr;</a>
      </div>
    </div>

    <!-- Notifications + Balance -->
    <div class="grid-2 section-gap">
      <div class="gp-card">
        <div class="gp-section-title-inner">Notifications</div>
        <div class="gp-notif-list">
          <div class="gp-notif-item">
            <div class="gp-notif-icon">${SVG.sms}</div>
            <div class="gp-notif-text">${Math.round(totalOrders * 0.3)} open customer requests</div>
            <div class="gp-notif-arrow">&rsaquo;</div>
          </div>
          <div class="gp-notif-item">
            <div class="gp-notif-icon">${SVG.gallery}</div>
            <div class="gp-notif-text">${Math.max(1, Math.round(totalOrders * 0.02))} orders in manual revision</div>
            <div class="gp-notif-arrow">&rsaquo;</div>
          </div>
        </div>
      </div>
      <div class="gp-card">
        <div class="gp-section-title-inner">Balance</div>
        <div class="gp-balance-grid">
          <div class="gp-balance-item">
            <div class="gp-balance-label">Stripe Express</div>
            <div class="gp-balance-value">$ ${(totalRevenue * 0.85).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} &rsaquo;</div>
          </div>
          <div class="gp-balance-item">
            <div class="gp-balance-label">GotPhoto</div>
            <div class="gp-balance-value gp-balance-neg">-$ ${Math.round(totalRevenue * 0.04).toLocaleString()} &rsaquo;</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Events & Resources -->
    <div class="gp-card section-gap">
      <div class="gp-card-header">
        <div class="gp-section-title-inner" style="margin:0">Events and resources</div>
        <a class="gp-card-footer-link">All resources &rarr;</a>
      </div>
      <div class="gp-events-list">
        <div class="gp-event-item">
          <div class="gp-event-icon">${SVG.campaigns}</div>
          <div class="gp-event-info">
            <div class="gp-event-name">Summer Camp 2026 Ticket Sales!</div>
            <div class="gp-event-date">Jun. 17, 2026 &bull; 5:59 AM</div>
          </div>
          <a class="gp-event-action">Register &rarr;</a>
        </div>
        <div class="gp-event-item">
          <div class="gp-event-icon">${SVG.campaigns}</div>
          <div class="gp-event-info">
            <div class="gp-event-name">Season Starter 2026 Webinar: Plan for Growth</div>
            <div class="gp-event-date">Feb. 26, 2026 &bull; 7:00 AM</div>
          </div>
          <a class="gp-event-action">Watch recording &rarr;</a>
        </div>
        <div class="gp-event-item">
          <div class="gp-event-icon">${SVG.campaigns}</div>
          <div class="gp-event-info">
            <div class="gp-event-name">Season Starter: Your Playbook for a Record-Breaking Fall</div>
            <div class="gp-event-date">Aug. 1, 2025 &bull; 2:39 PM</div>
          </div>
          <a class="gp-event-action">Watch recording &rarr;</a>
        </div>
      </div>
    </div>

    <!-- Client Accounts -->
    <div class="gp-card section-gap">
      <div class="gp-card-header">
        <div class="gp-section-title-inner" style="margin:0">Client Accounts</div>
        <span class="text-sm text-muted">${CLIENT_ACCOUNTS.length} accounts</span>
      </div>
      <div class="card-body">
        <div class="order-list">
          ${CLIENT_ACCOUNTS.map(a => {
            const students = a.studentIds.map(sid => STUDENTS.find(s => s.id === sid)?.name || sid).join(', ');
            return `
              <div class="order-item">
                <div class="order-item-main">
                  <div class="order-item-student">${a.name}</div>
                  <div class="order-item-package">${a.email} &middot; ${a.role} &middot; ${students}</div>
                </div>
                <div class="order-item-right">
                  <span class="badge ${a.status === 'active' ? 'badge-green' : 'badge-gray'}">${a.status === 'active' ? 'Active' : 'Inactive'}</span>
                  <div class="campaign-item-stat">Last login ${a.lastLogin}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Dashboard job tabs — Selling / Archived
  function renderDashJobRows(status) {
    const table = document.getElementById('dashJobsTable');
    // Keep header row, remove data rows
    table.querySelectorAll('.gp-jobs-row').forEach(r => r.remove());
    const filtered = GALLERY_JOBS.filter(gj => gj.status === status);
    filtered.forEach(gj => {
      const loginR = Math.round(70 + Math.random() * 30);
      const orderR = ((gj.orderCount || 0) / (gj.subjectCount || 1) * 100).toFixed(0);
      const row = document.createElement('div');
      row.className = 'gp-jobs-row';
      row.dataset.jobDash = gj.id;
      row.innerHTML = `
        <div class="gp-jobs-col-name">
          <div class="gp-jobs-icon">${SVG.camera}</div>
          <div>
            <div class="gp-jobs-name">${gj.name}</div>
            <div class="gp-jobs-school">${gj.school || gj.type}</div>
          </div>
        </div>
        <div class="gp-jobs-col">
          <div class="gp-jobs-date">${gj.createdDate ? formatDate(gj.createdDate).split(',')[0] : ''}</div>
        </div>
        <div class="gp-jobs-col">${loginR}%</div>
        <div class="gp-jobs-col">${orderR}%</div>
        <div class="gp-jobs-col gp-jobs-revenue">$${(gj.revenue || 0).toLocaleString()}</div>
        <div class="gp-jobs-col"><a class="gp-jobs-action">Open</a></div>
      `;
      row.addEventListener('click', () => {
        const job = GALLERY_JOBS.find(j => j.id === gj.id);
        if (job) navigate('jobDetail', job);
      });
      table.appendChild(row);
    });
  }

  document.getElementById('dashJobTabs')?.querySelectorAll('.gp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#dashJobTabs .gp-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderDashJobRows(tab.dataset.filter);
    });
  });

  // Job row click → detail
  el.querySelectorAll('[data-job-dash]').forEach(row => {
    row.addEventListener('click', () => {
      const job = GALLERY_JOBS.find(j => j.id === row.dataset.jobDash);
      if (job) navigate('jobDetail', job);
    });
  });

  document.getElementById('viewAllJobs')?.addEventListener('click', () => navigate('jobs'));
}

// ─── Page: Jobs ─────────────────────────────────────────
function renderJobs() {
  const el = document.getElementById('pageContent');
  const totalSubjects = GALLERY_JOBS.reduce((s, j) => s + (j.subjectCount || 0), 0);
  const totalRevenue = GALLERY_JOBS.reduce((s, j) => s + (j.revenue || 0), 0);
  el.innerHTML = `
    <div class="jobs-header">
      <div>
        <span class="text-sm text-muted">${GALLERY_JOBS.length} jobs &middot; ${totalSubjects} subjects &middot; $${totalRevenue.toLocaleString()} revenue</span>
      </div>
      <button class="btn btn-accent btn-sm">${SVG.plus} New Job</button>
    </div>
    <div class="jobs-grid">
      ${GALLERY_JOBS.map(gj => {
        const isYearbook = gj.type === 'Yearbook';
        const groupUrl = getGroupPhotoUrl(gj);
        return `
          <div class="job-card" data-job="${gj.id}">
            <div class="job-card-cover job-card-cover-gradient ${isYearbook ? 'yb' : 'sp'}">
              ${groupUrl ? `<img src="${groupUrl}" alt="${gj.name}" class="job-card-cover-group" onerror="this.style.display='none'">` : ''}
              <div class="job-card-cover-overlay">
                <div class="job-card-school-icon">${SVG.camera}</div>
                <div class="job-card-school-name">${gj.school || 'School'}</div>
              </div>
              <div class="job-card-badges">
                <span class="job-badge job-badge-year">${gj.year}</span>
                <span class="job-badge ${isYearbook ? 'job-badge-yearbook' : 'job-badge-spring'}">${gj.type}</span>
              </div>
              <div class="job-card-status">
                <span class="badge ${gj.status === 'active' ? 'badge-green' : 'badge-gray'}">${gj.status === 'active' ? 'Active' : 'Archived'}</span>
              </div>
            </div>
            <div class="job-card-body">
              <div class="job-card-name">${gj.name}</div>
              <div class="job-card-meta">
                <span>${gj.school || ''}</span>
                ${gj.accessCode ? `<span class="job-card-dot"></span><span class="job-card-code">${gj.accessCode}</span>` : ''}
              </div>
              <div class="job-card-stats">
                <div class="job-card-stat">
                  <span class="job-card-stat-val">${gj.subjectCount || 0}</span>
                  <span class="job-card-stat-label">Subjects</span>
                </div>
                <div class="job-card-stat">
                  <span class="job-card-stat-val">${gj.orderCount || 0}</span>
                  <span class="job-card-stat-label">Orders</span>
                </div>
                <div class="job-card-stat">
                  <span class="job-card-stat-val">$${(gj.revenue || 0).toLocaleString()}</span>
                  <span class="job-card-stat-label">Revenue</span>
                </div>
                <div class="job-card-stat">
                  <span class="job-card-stat-val">${gj.conversionRate || 0}%</span>
                  <span class="job-card-stat-label">Conv.</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  el.querySelectorAll('[data-job]').forEach(card => {
    card.addEventListener('click', () => {
      const job = GALLERY_JOBS.find(j => j.id === card.dataset.job);
      navigate('jobDetail', job);
    });
  });
}

// ─── Page: Orders ───────────────────────────────────────
function renderOrders() {
  const content = document.getElementById('pageContent');
  const openRequests = CUSTOMER_REQUESTS.filter(r => r.status === 'open').length;
  const pendingRequests = CUSTOMER_REQUESTS.filter(r => r.status === 'pending').length;

  content.innerHTML = `
    <div class="orders-tabs">
      <button class="orders-tab ${ordersTab === 'orders' ? 'active' : ''}" data-orders-tab="orders">
        ${SVG.orders} Orders <span class="orders-tab-count">${CUSTOMER_ORDERS.length}</span>
      </button>
      <button class="orders-tab ${ordersTab === 'requests' ? 'active' : ''}" data-orders-tab="requests">
        ${SVG.bell} Requests ${openRequests > 0 ? `<span class="orders-tab-count orders-tab-alert">${openRequests + pendingRequests}</span>` : ''}
      </button>
      <button class="orders-tab ${ordersTab === 'batch' ? 'active' : ''}" data-orders-tab="batch">
        ${SVG.packages} Batch Shipping
      </button>
    </div>
    <div id="ordersContent"></div>
  `;

  // Tab switching
  content.querySelectorAll('[data-orders-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      ordersTab = tab.dataset.ordersTab;
      renderOrders();
    });
  });

  const inner = document.getElementById('ordersContent');

  if (ordersTab === 'orders') {
    renderOrdersList(inner);
  } else if (ordersTab === 'requests') {
    renderRequestsList(inner);
  } else {
    renderBatchList(inner);
  }
}

function renderOrdersList(container) {
  const paymentIcons = {
    apple_pay: '\u{1F34E} Pay',
    google_pay: 'G Pay',
    card: '\u{1F4B3}',
    klarna: 'Klarna',
  };

  container.innerHTML = `
    <div class="card mt-16">
      <div class="card-header">
        <div class="card-title">Customer Orders</div>
        <div class="text-muted text-sm">${CUSTOMER_ORDERS.length} orders</div>
      </div>
      <div class="card-body" style="padding:0">
        <div class="orders-list">
          ${CUSTOMER_ORDERS.map(o => {
            const date = new Date(o.date);
            const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' \u00B7 ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const statusClass = o.payment === 'paid' ? 'badge-green' : 'badge-orange';
            return `
              <div class="order-feed-item">
                <div class="order-feed-main">
                  <div class="order-feed-top">
                    <span class="order-feed-name">${o.firstName} ${o.lastName}</span>
                    <span class="order-feed-amount">$${o.amount}</span>
                  </div>
                  <div class="order-feed-meta">
                    <span class="order-feed-student">${o.student}</span>
                    <span class="order-feed-dot">\u00B7</span>
                    <span>${o.package}</span>
                  </div>
                  <div class="order-feed-bottom">
                    <span class="order-feed-time">${timeStr}</span>
                    <span class="badge badge-sm ${statusClass}">${paymentIcons[o.paymentMethod] || '\u{1F4B3}'} ${o.payment}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderRequestsList(container) {
  const statusColors = { open: 'badge-red', pending: 'badge-orange', closed: 'badge-gray' };

  container.innerHTML = `
    <div class="card mt-16">
      <div class="card-header">
        <div class="card-title">Customer Requests</div>
      </div>
      <div class="card-body" style="padding:0">
        <div class="requests-list">
          ${CUSTOMER_REQUESTS.map(r => `
            <div class="request-item">
              <div class="request-item-header">
                <span class="badge ${statusColors[r.status] || 'badge-gray'}">${r.status}</span>
                <span class="request-item-type">${r.type}</span>
                <span class="request-item-order">Order #${r.orderNo}</span>
              </div>
              <div class="request-item-customer">${r.customer}</div>
              <div class="request-item-message">${r.message}</div>
              <div class="request-item-dates">
                <span class="text-muted text-xs">Created ${r.created}</span>
                <span class="text-muted text-xs">\u00B7 Updated ${r.modified}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderBatchList(container) {
  container.innerHTML = `
    <div class="card mt-16">
      <div class="card-header">
        <div class="card-title">Batch Shipping</div>
      </div>
      <div class="card-body" style="padding:0">
        <div class="batch-list">
          ${BATCH_SHIPPING.map(b => {
            const isActive = b.status === 'collecting';
            const deadline = new Date(b.deadline);
            const now = new Date();
            const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            return `
              <div class="batch-item ${isActive ? 'batch-active' : ''}">
                <div class="batch-item-top">
                  <span class="batch-item-name">${b.jobName}</span>
                  <span class="badge ${isActive ? 'badge-green' : 'badge-gray'}">${b.status}</span>
                </div>
                <div class="batch-item-meta">
                  <span>${b.orders} orders</span>
                  <span class="order-feed-dot">\u00B7</span>
                  <span>${b.internalName}</span>
                </div>
                <div class="batch-item-deadline">
                  ${isActive && daysLeft > 0 ? `<span class="batch-deadline-urgent">${daysLeft} days left</span>` : ''}
                  <span class="text-muted text-xs">Deadline: ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// ─── Page: Contacts ─────────────────────────────────────
function renderContacts() {
  const content = document.getElementById('pageContent');
  const buyerCount = CONTACTS.filter(c => c.status === 'buyer').length;
  const potentialCount = CONTACTS.filter(c => c.status === 'potential').length;

  content.innerHTML = `
    <div class="orders-tabs">
      <button class="orders-tab ${contactsTab === 'buyers' ? 'active' : ''}" data-contacts-tab="buyers">
        ${SVG.account} Buyers <span class="orders-tab-count">${buyerCount}</span>
      </button>
      <button class="orders-tab ${contactsTab === 'students' ? 'active' : ''}" data-contacts-tab="students">
        ${SVG.camera} Students
      </button>
      <button class="orders-tab ${contactsTab === 'orgs' ? 'active' : ''}" data-contacts-tab="orgs">
        ${SVG.jobs} Organizations
      </button>
    </div>
    <div id="contactsContent"></div>
  `;

  content.querySelectorAll('[data-contacts-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      contactsTab = tab.dataset.contactsTab;
      renderContacts();
    });
  });

  const inner = document.getElementById('contactsContent');

  if (contactsTab === 'buyers') {
    renderBuyersList(inner);
  } else if (contactsTab === 'students') {
    renderStudentsList(inner);
  } else {
    renderOrgsList(inner);
  }
}

function renderBuyersList(container) {
  const sorted = [...CONTACTS].sort((a, b) => b.totalSpent - a.totalSpent);
  container.innerHTML = `
    <div class="card mt-16">
      <div class="card-body" style="padding:0">
        <div class="contacts-list">
          ${sorted.map(c => {
            const initials = c.firstName[0] + c.lastName[0];
            const statusBadge = c.status === 'buyer' ? 'badge-green' : 'badge-orange';
            return `
              <div class="contact-item">
                <div class="avatar-circle avatar-sm">${initials}</div>
                <div class="contact-item-info">
                  <div class="contact-item-name">${c.firstName} ${c.lastName}</div>
                  <div class="contact-item-meta">
                    ${c.students.join(', ')} \u00B7 ${c.role}
                  </div>
                  <div class="contact-item-email">${c.email}</div>
                </div>
                <div class="contact-item-right">
                  <div class="contact-item-spent">${c.totalSpent > 0 ? '$' + c.totalSpent : '\u2014'}</div>
                  <div class="contact-item-orders">${c.orders} order${c.orders !== 1 ? 's' : ''}</div>
                  <span class="badge badge-sm ${statusBadge}">${c.status}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderStudentsList(container) {
  const allStudents = STUDENTS.map(s => {
    const job = GALLERY_JOBS.find(j => j.status === 'active');
    return { ...s, school: job?.school || 'United Day School', group: job?.grade || '', teacher: job?.teacher || '' };
  });

  container.innerHTML = `
    <div class="card mt-16">
      <div class="card-body" style="padding:0">
        <div class="contacts-list">
          ${allStudents.map(s => `
            <div class="contact-item">
              <div class="avatar-circle avatar-sm" style="background:var(--accent-light);color:white">${s.name.split(' ').map(n=>n[0]).join('')}</div>
              <div class="contact-item-info">
                <div class="contact-item-name">${s.name}</div>
                <div class="contact-item-meta">${s.school} \u00B7 ${s.grade}</div>
                <div class="contact-item-email">${s.teacher}</div>
              </div>
              <div class="contact-item-right">
                <div class="contact-item-spent">${s.photoCount} photos</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderOrgsList(container) {
  container.innerHTML = `
    <div class="card mt-16">
      <div class="card-body" style="padding:0">
        <div class="contacts-list">
          ${ORGANIZATIONS.map(org => `
            <div class="contact-item">
              <div class="avatar-circle avatar-sm" style="background:var(--green);color:white">${org.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
              <div class="contact-item-info">
                <div class="contact-item-name">${org.name}</div>
                <div class="contact-item-meta">${org.city}, ${org.state} \u00B7 ${org.jobs} jobs \u00B7 ${org.subjects} subjects</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ─── Page: Job Detail ───────────────────────────────────
function renderJobDetail(job) {
  if (!job) job = GALLERY_JOBS[0];
  const el = document.getElementById('pageContent');
  const isYearbook = job.type === 'Yearbook';
  const groupUrl = getGroupPhotoUrl(job);
  const funnel = JOB_FUNNELS[job.id];

  el.innerHTML = `
    <div class="back-link" id="backToJobs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;margin-right:4px"><polyline points="15 18 9 12 15 6"/></svg>Back to Jobs</div>

    <div class="job-detail-stats">
      <div class="stat-card stat-card-mini">
        <div class="stat-card-value">${job.subjectCount || 0}</div>
        <div class="stat-card-label">Subjects</div>
      </div>
      <div class="stat-card stat-card-mini">
        <div class="stat-card-value">$${(job.revenue || 0).toLocaleString()}</div>
        <div class="stat-card-label">Revenue</div>
      </div>
      <div class="stat-card stat-card-mini">
        <div class="stat-card-value">${job.orderCount || 0}</div>
        <div class="stat-card-label">Orders</div>
      </div>
      <div class="stat-card stat-card-mini">
        <div class="stat-card-value">${job.conversionRate || 0}%</div>
        <div class="stat-card-label">Conversion</div>
      </div>
    </div>

    <div class="job-detail-grid">
      <div class="job-detail-left">
        <div class="card" style="padding:24px">
          <div class="card-section-title">Job Configuration</div>
          <div class="form-group">
            <label class="form-label">Job Name</label>
            <input class="form-input" type="text" id="jobNameInput" value="${job.name}">
          </div>
          <div class="grid-2-compact">
            <div class="form-group">
              <label class="form-label">School</label>
              <input class="form-input" type="text" value="${job.school || ''}" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Access Code</label>
              <div class="form-input-copy">
                <input class="form-input" type="text" value="${job.accessCode || ''}" readonly>
              </div>
            </div>
          </div>
          <div class="grid-2-compact">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-select" id="jobTypeSelect">
                <option value="Yearbook" ${job.type === 'Yearbook' ? 'selected' : ''}>Yearbook</option>
                <option value="Spring Pictures" ${job.type === 'Spring Pictures' ? 'selected' : ''}>Spring Pictures</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Year</label>
              <input class="form-input" type="text" value="${job.year}" readonly>
            </div>
          </div>
          <div class="flex-row gap-20 mb-16">
            <div>
              <label class="form-label">Status</label>
              <div class="flex-row gap-8">
                <label class="toggle">
                  <input type="checkbox" ${job.status === 'active' ? 'checked' : ''} id="jobStatusToggle">
                  <div class="toggle-track"></div>
                  <div class="toggle-thumb"></div>
                </label>
                <span id="jobStatusLabel" style="font-weight:600;color:${job.status === 'active' ? 'var(--green)' : 'var(--text-muted)'}">${job.status === 'active' ? 'Active' : 'Archived'}</span>
              </div>
            </div>
            <div>
              <label class="form-label">Subjects</label>
              <div style="font-size:14px;font-weight:500">${job.subjectCount || 0} students</div>
            </div>
          </div>
          ${job.createdDate ? `
          <div class="grid-2-compact">
            <div class="form-group">
              <label class="form-label">Created</label>
              <div class="text-sm">${formatDate(job.createdDate)}</div>
            </div>
            ${job.archiveDate ? `
            <div class="form-group">
              <label class="form-label">Archive Date</label>
              <div class="text-sm">${formatDate(job.archiveDate)}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}
        </div>

        ${isYearbook ? `
        <div class="card" style="padding:24px;margin-top:20px">
          <div class="card-section-title">Yearbook Settings</div>
          <div class="form-group">
            <label class="form-label">Customer Photo Selection</label>
            <select class="form-select" id="ybSelectionType">
              <option value="no">No</option>
              <option value="favorite" selected>Favorite Photo</option>
              <option value="yearbook">Yearbook Photo</option>
              <option value="idcard">ID Card Photo</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Max Yearbook Picks</label>
            <div class="picks-control">
              <button class="picks-btn ${job.yearbookPicks === 1 ? 'active' : ''}" data-picks="1">1</button>
              <button class="picks-btn ${job.yearbookPicks === 2 ? 'active' : ''}" data-picks="2">2</button>
            </div>
            <div class="picks-note">
              Parents can select up to <strong id="picksCount">${job.yearbookPicks}</strong> top yearbook photo${job.yearbookPicks > 1 ? 's' : ''}
            </div>
            <div class="picks-feature-note">
              <span class="picks-feature-badge">New Feature</span>
              Current system only allows 1 pick — this allows up to 2
            </div>
          </div>
        </div>
        ` : ''}

        <div class="card" style="padding:24px;margin-top:20px">
          <div class="card-section-title">Campaign Toggles</div>
          <div class="toggle-row">
            <div>
              <div class="toggle-label">Last Chance Email</div>
              <div class="toggle-sublabel">Send reminder before archive</div>
            </div>
            <label class="toggle">
              <input type="checkbox" checked>
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
          <div class="toggle-row">
            <div>
              <div class="toggle-label">SMS Reminder</div>
              <div class="toggle-sublabel">Text notification to parents</div>
            </div>
            <label class="toggle">
              <input type="checkbox" checked>
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
        </div>

        <button class="btn btn-accent mt-24" style="width:100%">Save Changes</button>

        <!-- Job Lifecycle Card -->
        <div class="card mt-16">
          <div class="card-header"><div class="card-title">Job Lifecycle</div></div>
          <div class="card-body">
            <div class="lifecycle-bar">
              <div class="lifecycle-step ${job.status === 'active' ? 'lifecycle-past' : ''}" data-lifecycle="planning">
                <div class="lifecycle-dot"></div>
                <span>Planning</span>
              </div>
              <div class="lifecycle-line ${job.status === 'active' || job.status === 'archived' ? 'lifecycle-line-done' : ''}"></div>
              <div class="lifecycle-step ${job.status === 'active' ? 'lifecycle-current' : job.status === 'archived' ? 'lifecycle-past' : ''}" data-lifecycle="selling">
                <div class="lifecycle-dot"></div>
                <span>Selling</span>
              </div>
              <div class="lifecycle-line ${job.status === 'archived' ? 'lifecycle-line-done' : ''}"></div>
              <div class="lifecycle-step ${job.status === 'archived' ? 'lifecycle-current' : ''}" data-lifecycle="archived">
                <div class="lifecycle-dot"></div>
                <span>Archived</span>
              </div>
            </div>
            <div class="lifecycle-actions mt-16">
              ${job.status === 'active' ? `<button class="btn btn-outline btn-sm">\u2190 Back to Planning</button> <button class="btn btn-accent btn-sm">Archive Job \u2192</button>` : ''}
              ${job.status === 'archived' ? `<button class="btn btn-accent btn-sm">\u2190 Reactivate (Start Selling)</button>` : ''}
              ${job.status !== 'active' && job.status !== 'archived' ? `<button class="btn btn-accent btn-sm">Start Selling \u2192</button>` : ''}
            </div>
          </div>
        </div>

        <!-- Funnel Card -->
        ${funnel ? `
        <div class="card mt-16">
          <div class="card-header"><div class="card-title">Sales Funnel</div></div>
          <div class="card-body">
            <div class="funnel-chart">
              ${[
                { label: 'Access Codes', value: funnel.accessCodes, pct: 100 },
                { label: 'Logins', value: funnel.logins, pct: Math.round(funnel.logins / funnel.accessCodes * 100) },
                { label: 'Customers', value: funnel.customers, pct: Math.round(funnel.customers / funnel.accessCodes * 100) },
                { label: 'Orders', value: funnel.orders, pct: Math.round(funnel.orders / funnel.accessCodes * 100) },
              ].map(step => `
                <div class="funnel-step">
                  <div class="funnel-bar-wrap">
                    <div class="funnel-bar" style="width:${step.pct}%"></div>
                  </div>
                  <div class="funnel-label">
                    <span>${step.label}</span>
                    <span class="funnel-value">${step.value} <span class="text-muted">(${step.pct}%)</span></span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="funnel-rates mt-16">
              <div class="funnel-rate">
                <div class="funnel-rate-value">${funnel.loginRate}%</div>
                <div class="funnel-rate-label">Login Rate</div>
              </div>
              <div class="funnel-rate">
                <div class="funnel-rate-value">${funnel.orderRate}%</div>
                <div class="funnel-rate-label">Order Rate</div>
              </div>
              <div class="funnel-rate">
                <div class="funnel-rate-value">$${job.revenue > 0 && funnel.orders > 0 ? Math.round(job.revenue / funnel.orders) : 0}</div>
                <div class="funnel-rate-label">Avg per Order</div>
              </div>
            </div>
          </div>
        </div>` : ''}
      </div>

      <div class="job-detail-right">
        <div class="preview-label">Example Parent View</div>
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-content" id="phonePreviewContent">
              ${renderPhoneGalleryPreview(job)}
            </div>
            <div class="phone-home-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('backToJobs').addEventListener('click', () => navigate('jobs'));

  document.getElementById('jobNameInput').addEventListener('input', (e) => {
    const nameEl = document.querySelector('.phone-gallery-name');
    if (nameEl) nameEl.textContent = e.target.value;
  });

  document.getElementById('jobStatusToggle')?.addEventListener('change', (e) => {
    const label = document.getElementById('jobStatusLabel');
    if (e.target.checked) {
      job.status = 'active';
      label.textContent = 'Active';
      label.style.color = 'var(--green)';
    } else {
      job.status = 'archived';
      label.textContent = 'Archived';
      label.style.color = 'var(--text-muted)';
    }
  });

  // Yearbook picks buttons
  el.querySelectorAll('.picks-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const picks = parseInt(btn.dataset.picks);
      el.querySelectorAll('.picks-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const countEl = document.getElementById('picksCount');
      if (countEl) countEl.textContent = picks;
      // Update phone preview yearbook bar
      const ybBar = document.querySelector('.phone-yb-bar-count');
      if (ybBar) ybBar.textContent = `Select your top ${picks} photo${picks > 1 ? 's' : ''}`;
    });
  });
}

function renderPhoneGalleryPreview(job) {
  const isYearbook = job.type === 'Yearbook';
  const groupUrl = getGroupPhotoUrl(job);
  const previewPhotos = job.photos.slice(0, 6);
  const accent = PHOTOGRAPHER.theme.accent;
  const headerBg = PHOTOGRAPHER.theme.headerBg || '#1a1a2e';
  const firstPhoto = job.photos[0];
  const avatarUrl = firstPhoto ? getPhotoUrl(firstPhoto.file, job) : '';
  const maxPicks = job.yearbookPicks || 2;
  const daysLeft = job.status === 'active' ? 49 : '--';

  return `
    <div class="pp-brand-bar" style="background:${headerBg}">
      ${PHOTOGRAPHER.logo
        ? `<img src="${PHOTOGRAPHER.logo}" alt="${PHOTOGRAPHER.business}" class="pp-brand-logo">`
        : `<div class="pp-brand-name">${PHOTOGRAPHER.business}</div>`
      }
    </div>
    <div class="pp-hero">
      <div class="pp-hero-top">
        <div class="pp-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></div>
        <div class="pp-avatar">
          <img src="${avatarUrl}" alt="" onerror="this.style.display='none'">
        </div>
        <div class="pp-hero-info">
          <div class="pp-hero-name">${STUDENTS[0]?.name || 'Student'}</div>
          <div class="pp-hero-job">${job.name}</div>
          <div class="pp-hero-meta">${job.grade} · ${job.teacher}</div>
        </div>
        <div class="pp-share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </div>
      </div>
      <div class="pp-stats">
        <div class="pp-stat">
          <span class="pp-stat-num">${job.photos.length}</span>
          <span class="pp-stat-label">PHOTOS</span>
        </div>
        <div class="pp-stat-div"></div>
        <div class="pp-stat">
          <span class="pp-stat-num">0</span>
          <span class="pp-stat-label">FAVORITES</span>
        </div>
        <div class="pp-stat-div"></div>
        <div class="pp-stat">
          <span class="pp-stat-num" style="color:${accent}">${daysLeft}</span>
          <span class="pp-stat-label">${job.status === 'active' ? 'DAYS LEFT' : 'ARCHIVED'}</span>
        </div>
      </div>
      ${isYearbook ? `
      <div class="pp-yb-bar" style="background:${headerBg}">
        <span class="pp-yb-star" style="color:${accent}">★</span>
        <span class="pp-yb-text">Yearbook Photo Picks</span>
        <span class="pp-yb-count" style="background:${accent}">0/${maxPicks}</span>
        <div class="pp-yb-circles">
          ${Array.from({length: maxPicks}, (_, i) => `<span class="pp-yb-circle">${i + 1}</span>`).join('')}
        </div>
      </div>
      ` : ''}
      <div class="pp-action-row">
        <button class="pp-action-pill">♥ Favorites</button>
        <button class="pp-action-pill pp-action-primary">${SVG.packages} Shop Packages</button>
      </div>
    </div>
    ${groupUrl ? `
    <div class="pp-group-card">
      <img src="${groupUrl}" alt="Class Photo" onerror="this.parentNode.innerHTML='Class Photo'">
      <div class="pp-group-overlay">
        <div class="pp-group-label">Class Photo</div>
        <div class="pp-group-icons">
          <span class="pp-group-icon">★</span>
          <span class="pp-group-icon">♥</span>
        </div>
      </div>
    </div>
    ` : ''}
    <div class="pp-photo-grid">
      ${previewPhotos.map(p => `
        <div class="pp-photo-cell">
          <img src="${getPhotoUrl(p.file, job)}" alt="${p.label}" onerror="this.style.display='none'">
        </div>
      `).join('')}
    </div>
    <div class="pp-quick-add" style="background:${headerBg}">
      <div class="pp-quick-text">
        <div class="pp-quick-title">Get all ${job.photos.length} photos digitally</div>
        <div class="pp-quick-price">$199 — instant download</div>
      </div>
      <div class="pp-quick-btn" style="background:${accent}">Add to Cart</div>
    </div>
    <div class="pp-tab-bar">
      <div class="pp-tab pp-tab-active" style="color:${accent}">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
        <span>Gallery</span>
      </div>
      <div class="pp-tab">
        <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span>Packages</span>
      </div>
      <div class="pp-tab">
        <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Cart</span>
      </div>
      <div class="pp-tab">
        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Account</span>
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ─── Page: Packages ─────────────────────────────────────
function renderPackages() {
  const el = document.getElementById('pageContent');
  const getCat = (id) => CATEGORIES.find(c => c.id === id);

  el.innerHTML = `
    <div class="grid-3" id="pkgGrid">
      ${pkgState.map(p => {
        const cat = getCat(p.category);
        const isExpanded = expandedPkgId === p.id;
        return `
          <div class="pkg-card ${isExpanded ? 'expanded' : ''}" data-pkg="${p.id}">
            <div class="pkg-card-drag">${SVG.drag}</div>
            <div class="pkg-card-name">${p.name}</div>
            <div class="pkg-card-meta">
              <span class="pill" style="background:${cat.color}20;color:${cat.color}">${cat.label}</span>
            </div>
            <div class="pkg-card-price">${p.price > 0 ? '$' + p.price : 'Custom'}</div>
            <div class="pkg-card-items">${p.includes.length} items included</div>
            ${isExpanded ? renderPkgEditForm(p) : ''}
          </div>
        `;
      }).join('')}
      <div class="pkg-add-card">+ Add Package</div>
    </div>
  `;

  el.querySelectorAll('.pkg-card[data-pkg]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.pkg-edit-form')) return;
      const pkgId = card.dataset.pkg;
      expandedPkgId = expandedPkgId === pkgId ? null : pkgId;
      renderPackages();
    });
  });

  if (expandedPkgId) {
    attachPkgFormHandlers();
  }
}

function renderPkgEditForm(pkg) {
  const cat = CATEGORIES.find(c => c.id === pkg.category);
  return `
    <div class="pkg-edit-form" onclick="event.stopPropagation()">
      <div class="form-group">
        <label class="form-label">Name</label>
        <input class="form-input" type="text" id="editPkgName" value="${pkg.name}">
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="editPkgCat">
          ${CATEGORIES.map(c => `<option value="${c.id}" ${c.id === pkg.category ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Price</label>
        <input class="form-input" type="number" id="editPkgPrice" value="${pkg.price}">
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" id="editPkgDesc">${pkg.description}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Included Items</label>
        <div class="chips-wrap" id="editPkgChips">
          ${pkg.includes.map((item, i) => `<span class="chip">${item}<span class="chip-remove" data-idx="${i}">\u00D7</span></span>`).join('')}
        </div>
        <div style="margin-top:8px"><span class="text-sm" style="color:var(--accent);cursor:pointer;font-weight:600" id="addItemLink">+ Add Item</span></div>
      </div>
      <div class="flex-row gap-8 mt-16">
        <button class="btn btn-accent" id="savePkgBtn">Save</button>
        <button class="btn btn-outline" id="cancelPkgBtn">Cancel</button>
      </div>
    </div>
  `;
}

function attachPkgFormHandlers() {
  const pkg = pkgState.find(p => p.id === expandedPkgId);
  if (!pkg) return;

  document.getElementById('savePkgBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    pkg.name = document.getElementById('editPkgName').value;
    pkg.category = document.getElementById('editPkgCat').value;
    pkg.price = parseFloat(document.getElementById('editPkgPrice').value) || 0;
    pkg.description = document.getElementById('editPkgDesc').value;
    expandedPkgId = null;
    renderPackages();
  });

  document.getElementById('cancelPkgBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    expandedPkgId = null;
    renderPackages();
  });

  document.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      pkg.includes.splice(idx, 1);
      renderPackages();
    });
  });

  document.getElementById('addItemLink')?.addEventListener('click', (e) => {
    e.stopPropagation();
    pkg.includes.push('New item');
    renderPackages();
  });
}

// ─── Page: Analytics ────────────────────────────────────
function renderAnalytics() {
  const el = document.getElementById('pageContent');

  el.innerHTML = `
    <div class="grid-2 section-gap">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Revenue Over Time</span>
          <span class="text-xs text-muted">Last 30 days</span>
        </div>
        <div class="chart-container">
          ${smoothLineChart(ANALYTICS.revenue.monthly, 500, 260)}
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Photo Selection Stats</span>
        </div>
        <div class="chart-container">
          ${verticalBarChart(ANALYTICS.photoSelections, 500, 260)}
        </div>
      </div>
    </div>

    <div class="card section-gap">
      <div class="card-header">
        <span class="card-title">Package Popularity by Revenue</span>
      </div>
      <div class="chart-container">
        ${horizontalBarChart(ANALYTICS.packagePopularity, 700, 0)}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Top-Selling Packages</span>
      </div>
      <div class="card-body">
        ${ANALYTICS.packagePopularity.map((p, i) => `
          <div class="rank-item">
            <div class="rank-number ${i < 3 ? 'top-' + (i + 1) : ''}">${i + 1}</div>
            <div class="rank-info">
              <div class="rank-name">${p.name}</div>
              <div class="rank-meta">${p.orders} orders</div>
            </div>
            <div class="rank-value">$${p.revenue.toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card mt-24">
      <div class="card-header"><div class="card-title">Monthly Statistics</div></div>
      <div class="card-body" style="padding:0">
        <div class="monthly-table-wrap">
          <table class="monthly-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Payments</th>
                <th>GP Fee</th>
                <th>Production</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              ${MONTHLY_STATS.map(m => {
                const net = m.payments - m.refunds - m.gpFee - m.production - m.shipping;
                return `
                  <tr>
                    <td class="font-bold">${m.month}</td>
                    <td>${m.orders}</td>
                    <td>$${m.revenue.toLocaleString()}</td>
                    <td>$${m.payments.toLocaleString()}</td>
                    <td class="text-muted">-$${m.gpFee}</td>
                    <td class="text-muted">-$${m.production}</td>
                    <td class="${net >= 0 ? 'text-green' : 'text-red'}">$${net.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ─── Page: Campaigns ────────────────────────────────────
function renderCampaigns() {
  const el = document.getElementById('pageContent');

  el.innerHTML = `
    <div class="card section-gap">
      <div class="card-header">
        <span class="card-title">Campaigns</span>
        <button class="btn btn-accent btn-sm">Create Campaign</button>
      </div>
      <div class="card-body">
        <div class="campaign-list" id="campaignList">
          ${CAMPAIGNS.map(c => `
            <div class="campaign-item" data-campaign="${c.id}">
              <div class="campaign-item-main">
                <div class="campaign-item-name">${c.name}</div>
                <div class="campaign-item-meta">
                  <span class="badge ${c.type === 'email' ? 'badge-blue' : 'badge-green'}">${c.type === 'email' ? 'Email' : 'SMS'}</span>
                  <span class="badge ${c.status === 'sent' ? 'badge-green' : 'badge-orange'}">${c.status === 'sent' ? 'Sent' : 'Scheduled'}</span>
                  <span class="campaign-item-stat">${c.recipients} recipients</span>
                </div>
              </div>
              <div class="campaign-item-right">
                ${c.openRate !== null ? `<div class="campaign-item-stat"><strong>${c.openRate}%</strong> open</div>` : ''}
                ${c.clickRate !== null ? `<div class="campaign-item-stat"><strong>${c.clickRate}%</strong> click</div>` : ''}
              </div>
            </div>
            <div class="campaign-detail-card ${expandedCampaignId === c.id ? 'open' : ''}" id="detail-${c.id}">
              <div class="email-preview">
                <div class="email-preview-header">
                  <h4>${PHOTOGRAPHER.business}</h4>
                  <p>${c.subject || c.name}</p>
                </div>
                <div class="email-preview-body">
                  <div class="email-preview-photo">${SVG.gallery} Student Photo</div>
                  <div class="email-preview-text">${c.previewText.replace(/{parent_name}/g, 'Parent').replace(/{student_name}/g, 'Student').replace(/{gallery_link}/g, 'choicepix.gotphoto.com/s/...')}</div>
                  <button class="email-preview-cta">View Gallery</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">AI-Suggested Subject Lines</span>
      </div>
      <div style="padding:20px">
        <div class="ai-subject-pills">
          ${AI_SUBJECT_LINES.map((line, i) => `
            <div class="ai-pill ${selectedAiSubject === i ? 'selected' : ''}" data-ai="${i}">${line}</div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  el.querySelectorAll('.campaign-item').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.campaign;
      expandedCampaignId = expandedCampaignId === id ? null : id;
      document.querySelectorAll('.campaign-detail-card').forEach(d => d.classList.remove('open'));
      if (expandedCampaignId) {
        document.getElementById('detail-' + id)?.classList.add('open');
      }
    });
  });

  el.querySelectorAll('.ai-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedAiSubject = parseInt(pill.dataset.ai);
      el.querySelectorAll('.ai-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
  });
}

// ─── Page: Settings ─────────────────────────────────────
function renderSettings() {
  const el = document.getElementById('pageContent');
  const theme = PHOTOGRAPHER.theme;
  const activeJobCount = GALLERY_JOBS.filter(j => j.status === 'active').length;
  const totalPhotos = GALLERY_JOBS.reduce((s, j) => s + j.photos.length, 0);

  el.innerHTML = `
    <div class="grid-2 section-gap">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Photographer Profile</span>
        </div>
        <div class="settings-section">
          <div class="flex-row gap-16 mb-24">
            <div class="avatar-circle" style="width:64px;height:64px;font-size:22px">BK</div>
            <div>
              <div style="font-size:18px;font-weight:700">${PHOTOGRAPHER.name}</div>
              <div class="text-sm text-muted">${PHOTOGRAPHER.business}</div>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Email</div>
            <div class="settings-value">${PHOTOGRAPHER.email}</div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Phone</div>
            <div class="settings-value">${PHOTOGRAPHER.phone}</div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Business</div>
            <div class="settings-value">${PHOTOGRAPHER.business}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Plan & Usage</span>
        </div>
        <div class="settings-section">
          <div class="settings-row">
            <div class="settings-label">Current Plan</div>
            <div class="settings-value"><span class="badge badge-accent">GotPhoto Pro</span></div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Active Jobs</div>
            <div class="settings-value">${activeJobCount} / 10</div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Total Photos</div>
            <div class="settings-value">${totalPhotos}</div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Storage Used</div>
            <div class="settings-value">12.4 GB / 50 GB</div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Gallery Jobs</div>
            <div class="settings-value">${GALLERY_JOBS.length} total</div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Member Since</div>
            <div class="settings-value">January 2025</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card section-gap">
      <div class="card-header">
        <span class="card-title">Business Logo</span>
      </div>
      <div class="settings-section">
        <div class="brand-logo-layout">
          <div class="brand-logo-current">
            <div class="brand-logo-preview" id="logoPreview">
              <div class="brand-logo-placeholder" id="logoPlaceholder" style="${PHOTOGRAPHER.logo ? 'display:none' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;opacity:0.4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>No logo uploaded</span>
              </div>
              <img id="logoImage" src="${PHOTOGRAPHER.logo || ''}" alt="Business Logo" style="${PHOTOGRAPHER.logo ? '' : 'display:none;'}max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none';document.getElementById('logoPlaceholder').style.display=''">
            </div>
            <div class="brand-logo-info">
              <div class="text-sm" style="font-weight:600;margin-bottom:4px">Current Logo</div>
              <div class="text-xs text-muted">Displayed on galleries, emails, and receipts parents receive. Recommended: PNG or SVG, at least 400px wide.</div>
            </div>
          </div>
          <div class="brand-logo-actions">
            <label class="btn btn-accent" id="logoUploadBtn">
              <input type="file" accept="image/*,.svg" style="display:none" id="logoFileInput">
              Upload Logo
            </label>
            <button class="btn btn-outline" id="logoRemoveBtn" style="${PHOTOGRAPHER.logo ? '' : 'display:none'}">Remove</button>
          </div>
          <div class="brand-logo-where">
            <div class="text-xs text-muted" style="font-weight:600;margin-bottom:6px">Where your logo appears:</div>
            <div class="brand-logo-spots">
              <span class="badge badge-gray">Gallery Header</span>
              <span class="badge badge-gray">Email Campaigns</span>
              <span class="badge badge-gray">Order Receipts</span>
              <span class="badge badge-gray">Access Code Page</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Brand Colors</span>
      </div>
      <div class="settings-section">
        <div class="brand-colors-layout">
          <div class="brand-colors-form">
            <div class="form-group">
              <label class="form-label">Accent Color</label>
              <div class="color-input-row">
                <div class="color-swatch" style="background:${theme.accent}" id="accentSwatch"></div>
                <input class="form-input" type="text" value="${theme.accent}" id="accentInput" style="font-family:monospace">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Accent Light</label>
              <div class="color-input-row">
                <div class="color-swatch" style="background:${theme.accentLight}" id="accentLightSwatch"></div>
                <input class="form-input" type="text" value="${theme.accentLight}" id="accentLightInput" style="font-family:monospace">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Header Background</label>
              <div class="color-input-row">
                <div class="color-swatch" style="background:${theme.headerBg || '#1a1a2e'}" id="headerBgSwatch"></div>
                <input class="form-input" type="text" value="${theme.headerBg || '#1a1a2e'}" id="headerBgInput" style="font-family:monospace">
              </div>
              <div class="text-xs text-muted mt-8">Background color for the logo bar shown at the top of the client app.</div>
            </div>
            <div class="brand-defaults-note">
              <div class="brand-defaults-title">GotPhoto Defaults</div>
              <div class="brand-defaults-colors">
                <span class="color-swatch-sm" style="background:${GOTPHOTO_DEFAULTS.accent}"></span>
                <span class="text-sm text-muted">${GOTPHOTO_DEFAULTS.accent} (blue)</span>
                <span class="color-swatch-sm" style="background:${GOTPHOTO_DEFAULTS.accentLight}"></span>
                <span class="text-sm text-muted">${GOTPHOTO_DEFAULTS.accentLight}</span>
              </div>
              <div class="text-xs text-muted mt-8">Your brand colors override the GotPhoto defaults in parent-facing views.</div>
            </div>
          </div>
          <div class="brand-preview">
            <div class="brand-preview-title">Preview</div>
            <div class="brand-preview-card" id="brandPreviewCard">
              <div class="brand-preview-header" style="background:${theme.accent}">
                <div style="font-weight:700;color:#fff;font-size:13px">ChoicePix Photography</div>
                <div style="color:rgba(255,255,255,0.8);font-size:10px;margin-top:2px">Gallery Preview</div>
              </div>
              <div class="brand-preview-body">
                <div class="brand-preview-btn" style="background:${theme.accent}">View Photos</div>
                <div class="brand-preview-btn-outline" style="color:${theme.accent};border-color:${theme.accent}">Share Gallery</div>
                <div class="brand-preview-link" style="color:${theme.accent}">Order Prints</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Live color preview
  const updatePreview = () => {
    const accent = document.getElementById('accentInput').value;
    const accentLight = document.getElementById('accentLightInput').value;
    const headerBg = document.getElementById('headerBgInput').value;
    document.getElementById('accentSwatch').style.background = accent;
    document.getElementById('accentLightSwatch').style.background = accentLight;
    document.getElementById('headerBgSwatch').style.background = headerBg;
    const card = document.getElementById('brandPreviewCard');
    card.querySelector('.brand-preview-header').style.background = accent;
    card.querySelector('.brand-preview-btn').style.background = accent;
    card.querySelector('.brand-preview-btn-outline').style.color = accent;
    card.querySelector('.brand-preview-btn-outline').style.borderColor = accent;
    card.querySelector('.brand-preview-link').style.color = accent;
    // Update shared data so client app picks it up
    PHOTOGRAPHER.theme.headerBg = headerBg;
  };

  document.getElementById('accentInput')?.addEventListener('input', updatePreview);
  document.getElementById('accentLightInput')?.addEventListener('input', updatePreview);
  document.getElementById('headerBgInput')?.addEventListener('input', updatePreview);

  // Logo upload preview
  document.getElementById('logoFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.getElementById('logoImage');
      const placeholder = document.getElementById('logoPlaceholder');
      const removeBtn = document.getElementById('logoRemoveBtn');
      img.src = ev.target.result;
      img.style.display = 'block';
      placeholder.style.display = 'none';
      removeBtn.style.display = '';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('logoRemoveBtn')?.addEventListener('click', () => {
    const img = document.getElementById('logoImage');
    const placeholder = document.getElementById('logoPlaceholder');
    const removeBtn = document.getElementById('logoRemoveBtn');
    img.src = '';
    img.style.display = 'none';
    placeholder.style.display = '';
    removeBtn.style.display = 'none';
  });
}

// ─── Init ───────────────────────────────────────────────
navigate('dashboard');
