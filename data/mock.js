// GotPhoto Demo — Shared Mock Data
// Based on Bert Kiefer's ChoicePix Photography / GotPhoto setup

export const PHOTOGRAPHER = {
  name: 'Bert Kiefer',
  business: 'ChoicePix Photography',
  email: 'bert@choicepix.com',
  phone: '(956) 555-0142',
  avatar: null, // CSS initials fallback: BK
  logo: '../branding/choicepix-logo.png',
  // Brand theme — photographer picks these in admin
  theme: {
    accent: '#e85d04',       // ChoicePix orange
    accentLight: '#f4845f',
  }
};

// GotPhoto platform defaults (used when photographer has no custom theme)
export const GOTPHOTO_DEFAULTS = {
  accent: '#4FABFD',         // GotPhoto blue (from logo)
  accentLight: '#7fc4fd',
};

export const JOBS = [
  {
    id: 'job-001',
    name: 'United Day Elementary 2026',
    status: 'active',
    accessCode: 'CHOICEPIX-2026',
    subjectCount: 156,
    revenue: 12450,
    orderCount: 47,
    conversionRate: 34,
    avgOrderValue: 265,
    createdDate: '2026-01-15',
    archiveDate: '2026-04-30',
    galleryUrl: 'choicepix.gotphoto.com/s/lincoln-seniors-2026'
  },
  {
    id: 'job-002',
    name: 'Roosevelt Elementary Fall 2025',
    status: 'archived',
    accessCode: 'CHOICEPIX-ROOSEVELT',
    subjectCount: 89,
    revenue: 6820,
    orderCount: 34,
    conversionRate: 38,
    avgOrderValue: 201,
    createdDate: '2025-09-01',
    archiveDate: '2025-12-15',
    galleryUrl: 'choicepix.gotphoto.com/s/roosevelt-fall-2025'
  },
  {
    id: 'job-003',
    name: 'St. Augustine Spring Portraits 2026',
    status: 'active',
    accessCode: 'CHOICEPIX-STAUGUSTINE',
    subjectCount: 112,
    revenue: 3200,
    orderCount: 15,
    conversionRate: 22,
    avgOrderValue: 213,
    createdDate: '2026-02-20',
    archiveDate: '2026-06-01',
    galleryUrl: 'choicepix.gotphoto.com/s/staugustine-spring-2026'
  }
];

export const STUDENTS = [
  { id: 's-001', name: 'Angie Kiefer', grade: '4th Grade', photoCount: 16 },
  { id: 's-002', name: 'Marcus Rivera', grade: 'Senior', photoCount: 6 },
  { id: 's-003', name: 'Sofia Chen', grade: 'Senior', photoCount: 7 },
  { id: 's-004', name: 'Tyler Washington', grade: 'Senior', photoCount: 8 },
  { id: 's-005', name: 'Emma Gutierrez', grade: 'Senior', photoCount: 6 }
];

// Client app accounts (parents/guardians)
export const CLIENT_ACCOUNTS = [
  {
    id: 'ca-001',
    email: 'kevin@shalaworks.com',
    password: 'shalaworks',
    name: 'Kevin Kiefer',
    role: 'Brother',
    studentIds: ['s-001'],
    lastLogin: '2026-03-13',
    status: 'active',
  },
  {
    id: 'ca-002',
    email: 'maria.rivera@email.com',
    password: 'photos2026',
    name: 'Maria Rivera',
    role: 'Parent',
    studentIds: ['s-002'],
    lastLogin: '2026-03-10',
    status: 'active',
  },
  {
    id: 'ca-003',
    email: 'linda.chen@email.com',
    password: 'sofia123',
    name: 'Linda Chen',
    role: 'Parent',
    studentIds: ['s-003'],
    lastLogin: '2026-03-08',
    status: 'active',
  },
  {
    id: 'ca-004',
    email: 'bert@choicepix.com',
    password: 'angie2026',
    name: 'Bert Kiefer',
    role: 'Father',
    studentIds: ['s-001'],
    lastLogin: '2026-03-05',
    status: 'active',
  },
];

export const CATEGORIES = [
  { id: 'digital', label: 'Digital', color: '#6366f1' },
  { id: 'prints', label: 'Prints', color: '#f59e0b' },
  { id: 'canvas', label: 'Canvas & Wall Art', color: '#10b981' },
  { id: 'frames', label: 'Frames', color: '#8b5cf6' },
  { id: 'build', label: 'Build Your Own', color: '#ec4899' }
];

export const PACKAGES = [
  {
    id: 'pkg-001',
    name: 'Digital Collection — All Photos',
    category: 'digital',
    price: 199,
    description: 'Every photo from your session in full resolution. Instant digital download.',
    includes: ['All digital photos', 'Full resolution', 'Instant download', 'Print release included'],
    photoCount: 0, // 0 = all photos
    recommended: false,
    popular: true
  },
  {
    id: 'pkg-002',
    name: 'Essentials Print Package',
    category: 'prints',
    price: 89,
    description: 'Classic print collection — perfect for sharing with family.',
    includes: ['2 — 8×10 prints', '4 — 5×7 prints', '8 — Wallet prints'],
    photoCount: 3,
    recommended: false,
    popular: false
  },
  {
    id: 'pkg-003',
    name: 'Premium Print + Digital',
    category: 'prints',
    price: 249,
    description: 'The best of both worlds. Premium prints plus all your digital photos.',
    includes: ['All digital photos', '3 — 8×10 prints', '6 — 5×7 prints', '16 — Wallet prints', '1 — 11×14 print'],
    photoCount: 4,
    recommended: true,
    popular: true
  },
  {
    id: 'pkg-004',
    name: 'Canvas Portrait 16×20',
    category: 'canvas',
    price: 175,
    description: 'Gallery-wrapped canvas — ready to hang. A stunning statement piece.',
    includes: ['1 — 16×20 canvas wrap', 'Gallery wrap edges', 'Ready to hang hardware'],
    photoCount: 1,
    recommended: false,
    popular: false
  },
  {
    id: 'pkg-005',
    name: 'Framed Collection',
    category: 'frames',
    price: 299,
    description: 'Three beautifully framed portraits in coordinating frames.',
    includes: ['1 — 11×14 framed print', '2 — 8×10 framed prints', 'Premium matte finish', 'Coordinating frames'],
    photoCount: 3,
    recommended: false,
    popular: false
  },
  {
    id: 'pkg-006',
    name: 'Wallet & Minis Pack',
    category: 'prints',
    price: 45,
    description: 'Share with friends and family — wallet-sized prints and mini cards.',
    includes: ['24 — Wallet prints', '12 — Mini cards', '2 photo choices'],
    photoCount: 2,
    recommended: false,
    popular: false
  },
  {
    id: 'pkg-007',
    name: 'Build Your Own',
    category: 'build',
    price: 0, // variable
    description: 'Create a custom package. Pick exactly what you want.',
    includes: ['Choose any prints', 'Add digital photos', 'Add canvas or frames', 'Custom combinations'],
    photoCount: 0,
    recommended: false,
    popular: false,
    isCustom: true
  }
];

// Gallery jobs — real photo jobs, reverse chronological (newest first)
// All photos are of Angie Kiefer, kindergarten through 4th grade at United Day School
export const GALLERY_JOBS = [
  {
    id: 'gj-001',
    name: '2025-26 UDS Yearbook',
    school: 'United Day School',
    year: '2025-26',
    type: 'Yearbook',
    yearbookPicks: 2,
    grade: '4th Grade',
    teacher: 'Mrs. Sandra Rodriguez',
    status: 'active',
    subjectCount: 156,
    revenue: 12450,
    orderCount: 47,
    conversionRate: 34,
    accessCode: 'CHOICEPIX-2026',
    createdDate: '2026-01-15',
    archiveDate: '2026-04-30',
    folder: '2025-26 UDS Yearbook/4 - Rodriguez, Sandra',
    photos: [
      { id: 'gj1-p001', file: '2025-26 UDS_YB_BK-8857.jpg', label: 'Pose 1' },
      { id: 'gj1-p002', file: '2025-26 UDS_YB_BK-8858.jpg', label: 'Pose 2' },
      { id: 'gj1-p003', file: '2025-26 UDS_YB_BK-8859.jpg', label: 'Pose 3' },
      { id: 'gj1-p004', file: '2025-26 UDS_YB_BK-8860.jpg', label: 'Pose 4' },
      { id: 'gj1-p005', file: '2025-26 UDS_YB_BK-8861.jpg', label: 'Pose 5' },
      { id: 'gj1-p006', file: '2025-26 UDS_YB_BK-8862.jpg', label: 'Pose 6' },
      { id: 'gj1-p007', file: '2025-26 UDS_YB_BK-8863.jpg', label: 'Pose 7' },
      { id: 'gj1-p008', file: '2025-26 UDS_YB_BK-8864.jpg', label: 'Pose 8' },
      { id: 'gj1-p009', file: '2025-26 UDS_YB_BK-8865.jpg', label: 'Pose 9' },
      { id: 'gj1-p010', file: '2025-26 UDS_YB_BK-8866.jpg', label: 'Pose 10' },
      { id: 'gj1-p011', file: '2025-26 UDS_YB_BK-8867.jpg', label: 'Pose 11' },
      { id: 'gj1-p012', file: '2025-26 UDS_YB_BK-8868.jpg', label: 'Pose 12' },
      { id: 'gj1-p013', file: '2025-26 UDS_YB_BK-8869.jpg', label: 'Pose 13' },
      { id: 'gj1-p014', file: '2025-26 UDS_YB_BK-8870.jpg', label: 'Pose 14' },
      { id: 'gj1-p015', file: '2025-26 UDS_YB_BK-8871.jpg', label: 'Pose 15' },
      { id: 'gj1-p016', file: '2025-26 UDS_YB_BK-8872.jpg', label: 'Pose 16' },
    ],
    groupPhoto: '4th Sandra Rodriguez.jpg',
  },
  {
    id: 'gj-002',
    name: '2024-25 United Day Spring Pictures',
    school: 'United Day School',
    year: '2024-25',
    type: 'Spring Pictures',
    grade: '3rd Grade',
    teacher: 'Mrs. Maribel Garcia',
    status: 'archived',
    subjectCount: 89,
    revenue: 6820,
    orderCount: 34,
    conversionRate: 38,
    accessCode: 'CHOICEPIX-SPRING25',
    createdDate: '2024-09-01',
    archiveDate: '2025-03-15',
    folder: '2024-25 United Day SPRING Pictures 3/3rd - Garcia, Maribel',
    photos: [
      { id: 'gj2-p001', file: '2024-25_UDS_SPCh-9682.jpg', label: 'Pose 1' },
      { id: 'gj2-p002', file: '2024-25_UDS_SPCh-9683.jpg', label: 'Pose 2' },
      { id: 'gj2-p003', file: '2024-25_UDS_SPCh-9684.jpg', label: 'Pose 3' },
      { id: 'gj2-p004', file: '2024-25_UDS_SPCh-9685.jpg', label: 'Pose 4' },
      { id: 'gj2-p005', file: '2024-25_UDS_SPCh-9686.jpg', label: 'Pose 5' },
      { id: 'gj2-p006', file: '2024-25_UDS_SPCh-9687.jpg', label: 'Pose 6' },
      { id: 'gj2-p007', file: '2024-25_UDS_SPCh-9689.jpg', label: 'Pose 7' },
      { id: 'gj2-p008', file: '2024-25_UDS_SPCh-9690.jpg', label: 'Pose 8' },
      { id: 'gj2-p009', file: '2024-25_UDS_SPCh-9691.jpg', label: 'Pose 9' },
      { id: 'gj2-p010', file: '2024-25_UDS_SPCh-9692.jpg', label: 'Pose 10' },
      { id: 'gj2-p011', file: '2024-25_UDS_SPCh-9693.jpg', label: 'Pose 11' },
      { id: 'gj2-p012', file: '2024-25_UDS_SPCh-9694.jpg', label: 'Pose 12' },
      { id: 'gj2-p013', file: '2024-25_UDS_SPCh-9695.jpg', label: 'Pose 13' },
      { id: 'gj2-p014', file: '2024-25_UDS_SPCh-9697.jpg', label: 'Pose 14' },
      { id: 'gj2-p015', file: '2024-25_UDS_SPCh-9698.jpg', label: 'Pose 15' },
      { id: 'gj2-p016', file: '2024-25_UDS_SPCh-9699.jpg', label: 'Pose 16' },
      { id: 'gj2-p017', file: '2024-25_UDS_SPCh-9700.jpg', label: 'Pose 17' },
      { id: 'gj2-p018', file: '2024-25_UDS_SPCh-9701.jpg', label: 'Pose 18' },
      { id: 'gj2-p019', file: '2024-25_UDS_SPCh-9702.jpg', label: 'Pose 19' },
      { id: 'gj2-p020', file: '2024-25_UDS_SPCh-9703.jpg', label: 'Pose 20' },
      { id: 'gj2-p021', file: '2024-25_UDS_SPCh-9705.jpg', label: 'Pose 21' },
      { id: 'gj2-p022', file: '2024-25_UDS_SPCh-9706.jpg', label: 'Pose 22' },
      { id: 'gj2-p023', file: '2024-25_UDS_SPCh-9707.jpg', label: 'Pose 23' },
      { id: 'gj2-p024', file: '2024-25_UDS_SPCh-9708.jpg', label: 'Pose 24' },
    ],
    groupPhoto: null,
  },
  {
    id: 'gj-003',
    name: '2024-25 United Day Yearbook',
    school: 'United Day School',
    year: '2024-25',
    type: 'Yearbook',
    yearbookPicks: 1,
    grade: '3rd Grade',
    teacher: 'Mrs. Maribel Garcia',
    status: 'archived',
    subjectCount: 89,
    revenue: 5480,
    orderCount: 31,
    conversionRate: 35,
    accessCode: 'CHOICEPIX-YB2425',
    createdDate: '2024-08-15',
    archiveDate: '2025-02-28',
    folder: '2024-25 United Day Yearbook/3rd - Garcia, Maribel',
    photos: [
      { id: 'gj3-p001', file: '2024-25 UDS_YB_BK-9428.jpg', label: 'Pose 1' },
      { id: 'gj3-p002', file: '2024-25 UDS_YB_BK-9429.jpg', label: 'Pose 2' },
      { id: 'gj3-p003', file: '2024-25 UDS_YB_BK-9430.jpg', label: 'Pose 3' },
      { id: 'gj3-p004', file: '2024-25 UDS_YB_BK-9431.jpg', label: 'Pose 4' },
      { id: 'gj3-p005', file: '2024-25 UDS_YB_BK-9432.jpg', label: 'Pose 5' },
      { id: 'gj3-p006', file: '2024-25 UDS_YB_BK-9433.jpg', label: 'Pose 6' },
      { id: 'gj3-p007', file: '2024-25 UDS_YB_BK-9434.jpg', label: 'Pose 7' },
      { id: 'gj3-p008', file: '2024-25 UDS_YB_BK-9435.jpg', label: 'Pose 8' },
    ],
    groupPhoto: 'Mrs Maribel Garcia.jpg',
  },
  {
    id: 'gj-004',
    name: '2023-24 UDS Yearbook',
    school: 'United Day School',
    year: '2023-24',
    type: 'Yearbook',
    yearbookPicks: 2,
    grade: '2nd Grade',
    teacher: 'Mrs. Selina Lopez',
    status: 'archived',
    subjectCount: 134,
    revenue: 9870,
    orderCount: 52,
    conversionRate: 39,
    accessCode: 'CHOICEPIX-YB2324',
    createdDate: '2023-08-20',
    archiveDate: '2024-03-01',
    folder: '2023-24 UDS YEARBOOK/2nd - Selina Lopez',
    photos: [
      { id: 'gj4-p001', file: '2023-24 UDS_YB_BK-1137.jpg', label: 'Pose 1' },
      { id: 'gj4-p002', file: '2023-24 UDS_YB_BK-1138.jpg', label: 'Pose 2' },
      { id: 'gj4-p003', file: '2023-24 UDS_YB_BK-1139.jpg', label: 'Pose 3' },
      { id: 'gj4-p004', file: '2023-24 UDS_YB_BK-1140.jpg', label: 'Pose 4' },
      { id: 'gj4-p005', file: '2023-24 UDS_YB_BK-1141.jpg', label: 'Pose 5' },
      { id: 'gj4-p006', file: '2023-24 UDS_YB_BK-1142.jpg', label: 'Pose 6' },
      { id: 'gj4-p007', file: '2023-24 UDS_YB_BK-1143.jpg', label: 'Pose 7' },
      { id: 'gj4-p008', file: '2023-24 UDS_YB_BK-1144.jpg', label: 'Pose 8' },
      { id: 'gj4-p009', file: '2023-24 UDS_YB_BK-1145.jpg', label: 'Pose 9' },
      { id: 'gj4-p010', file: '2023-24 UDS_YB_BK-1146.jpg', label: 'Pose 10' },
      { id: 'gj4-p011', file: '2023-24 UDS_YB_BK-1147.jpg', label: 'Pose 11' },
      { id: 'gj4-p012', file: '2023-24 UDS_YB_BK-1148.jpg', label: 'Pose 12' },
      { id: 'gj4-p013', file: '2023-24 UDS_YB_BK-1149.jpg', label: 'Pose 13' },
      { id: 'gj4-p014', file: '2023-24 UDS_YB_BK-1150.jpg', label: 'Pose 14' },
      { id: 'gj4-p015', file: '2023-24 UDS_YB_BK-1151.jpg', label: 'Pose 15' },
      { id: 'gj4-p016', file: '2023-24 UDS_YB_BK-1152.jpg', label: 'Pose 16' },
      { id: 'gj4-p017', file: '2023-24 UDS_YB_BK-1153.jpg', label: 'Pose 17' },
      { id: 'gj4-p018', file: '2023-24 UDS_YB_BK-1154.jpg', label: 'Pose 18' },
      { id: 'gj4-p019', file: '2023-24 UDS_YB_BK-1155.jpg', label: 'Pose 19' },
      { id: 'gj4-p020', file: '2023-24 UDS_YB_BK-1156.jpg', label: 'Pose 20' },
      { id: 'gj4-p021', file: '2023-24 UDS_YB_BK-1157.jpg', label: 'Pose 21' },
    ],
    groupPhoto: 'Mrs Selina Lopez.jpg',
  },
  {
    id: 'gj-005',
    name: '2021-22 United Day School Spring Pictures',
    school: 'United Day School',
    year: '2021-22',
    type: 'Spring Pictures',
    grade: 'Kindergarten',
    teacher: 'Mrs. Florencia Rodriguez',
    status: 'archived',
    subjectCount: 112,
    revenue: 4350,
    orderCount: 28,
    conversionRate: 25,
    accessCode: 'CHOICEPIX-SP2122',
    createdDate: '2022-02-01',
    archiveDate: '2022-06-30',
    folder: '2021-22 United Day School Spring Pictures/K - Florencia Rodriguez',
    photos: [
      { id: 'gj5-p001', file: '2021-22 UDS Spring Chacho-404.jpg', label: 'Pose 1' },
      { id: 'gj5-p002', file: '2021-22 UDS Spring Chacho-405.jpg', label: 'Pose 2' },
      { id: 'gj5-p003', file: '2021-22 UDS Spring Chacho-406.jpg', label: 'Pose 3' },
      { id: 'gj5-p004', file: '2021-22 UDS Spring Chacho-407.jpg', label: 'Pose 4' },
      { id: 'gj5-p005', file: '2021-22 UDS Spring Chacho-408.jpg', label: 'Pose 5' },
      { id: 'gj5-p006', file: '2021-22 UDS Spring Chacho-409.jpg', label: 'Pose 6' },
      { id: 'gj5-p007', file: '2021-22 UDS Spring Chacho-410.jpg', label: 'Pose 7' },
      { id: 'gj5-p008', file: '2021-22 UDS Spring Chacho-411.jpg', label: 'Pose 8' },
      { id: 'gj5-p009', file: '2021-22 UDS Spring Chacho-412.jpg', label: 'Pose 9' },
      { id: 'gj5-p010', file: '2021-22 UDS Spring Chacho-413.jpg', label: 'Pose 10' },
      { id: 'gj5-p011', file: '2021-22 UDS Spring Chacho-414.jpg', label: 'Pose 11' },
      { id: 'gj5-p012', file: '2021-22 UDS Spring Chacho-415.jpg', label: 'Pose 12' },
      { id: 'gj5-p013', file: '2021-22 UDS Spring Chacho-416.jpg', label: 'Pose 13' },
      { id: 'gj5-p014', file: '2021-22 UDS Spring Chacho-417.jpg', label: 'Pose 14' },
      { id: 'gj5-p015', file: '2021-22 UDS Spring Chacho-418.jpg', label: 'Pose 15' },
      { id: 'gj5-p016', file: '2021-22 UDS Spring Chacho-419.jpg', label: 'Pose 16' },
      { id: 'gj5-p017', file: '2021-22 UDS Spring Chacho-420.jpg', label: 'Pose 17' },
      { id: 'gj5-p018', file: '2021-22 UDS Spring Chacho-421.jpg', label: 'Pose 18' },
    ],
    groupPhoto: null,
  },
];

// Backward-compatible PHOTOS — points to the active (newest) job's photos
export const PHOTOS = GALLERY_JOBS[0].photos;

export function getPhotoUrl(fileOrId, job = null) {
  if (job) {
    return `../photos/${job.folder}/individuals/${fileOrId}`;
  }
  // Fallback: look through all jobs
  for (const gj of GALLERY_JOBS) {
    const found = gj.photos.find(p => p.id === fileOrId || p.file === fileOrId);
    if (found) return `../photos/${gj.folder}/individuals/${found.file}`;
  }
  return `../photos/${fileOrId}`;
}

export function getGroupPhotoUrl(job) {
  if (!job || !job.groupPhoto) return null;
  return `../photos/${job.folder}/group/${job.groupPhoto}`;
}

export function getPhotoThumb(fileOrId, job = null) {
  // Same as full — browser handles sizing via img element
  return getPhotoUrl(fileOrId, job);
}

// Recent orders for admin dashboard
export const ORDERS = [
  { id: 'ord-001', student: 'Allanah Mendoza', package: 'Premium Print + Digital', amount: 249, time: '2 hours ago', status: 'completed' },
  { id: 'ord-002', student: 'Marcus Rivera', package: 'Digital Collection — All Photos', amount: 199, time: '3 hours ago', status: 'completed' },
  { id: 'ord-003', student: 'Sofia Chen', package: 'Framed Collection', amount: 299, time: '5 hours ago', status: 'processing' },
  { id: 'ord-004', student: 'Tyler Washington', package: 'Essentials Print Package', amount: 89, time: '6 hours ago', status: 'completed' },
  { id: 'ord-005', student: 'Emma Gutierrez', package: 'Canvas Portrait 16×20', amount: 175, time: 'Yesterday', status: 'completed' },
  { id: 'ord-006', student: 'Jake Martinez', package: 'Premium Print + Digital', amount: 249, time: 'Yesterday', status: 'completed' },
  { id: 'ord-007', student: 'Lily Thompson', package: 'Digital Collection — All Photos', amount: 199, time: 'Yesterday', status: 'completed' },
  { id: 'ord-008', student: 'Diego Salazar', package: 'Wallet & Minis Pack', amount: 45, time: '2 days ago', status: 'completed' },
  { id: 'ord-009', student: 'Ava Nguyen', package: 'Essentials Print Package', amount: 89, time: '2 days ago', status: 'completed' },
  { id: 'ord-010', student: 'Chris Brown', package: 'Premium Print + Digital', amount: 249, time: '3 days ago', status: 'completed' }
];

// Analytics data for charts
export const ANALYTICS = {
  revenue: {
    total: 12450,
    trend: 12, // +12%
    daily: [
      { date: '6 Mar',  revenue: 1845, cost: 245 },
      { date: '7 Mar',  revenue: 2120, cost: 280 },
      { date: '8 Mar',  revenue: 1560, cost: 210 },
      { date: '9 Mar',  revenue: 980,  cost: 195 },
      { date: '10 Mar', revenue: 2340, cost: 310 },
      { date: '11 Mar', revenue: 1890, cost: 265 },
      { date: '12 Mar', revenue: 1650, cost: 230 },
    ],
    weeklyTotal: 12385,
    weeklyTrend: -4.2,
    monthly: [
      1200, 1450, 980, 1650, 2100, 1890, 1750, 2300, 1950, 2450, 2890, 3200,
      2100, 1800, 2400, 2650, 3100, 2750, 2200, 1950, 2800, 3350, 2900, 2450,
      3100, 3500, 2800, 3200, 3800, 4200
    ]
  },
  orders: {
    total: 47,
    trend: 8
  },
  galleries: {
    active: 3
  },
  conversion: {
    rate: 34,
    trend: 5
  },
  avgOrder: {
    value: 265,
    trend: -2
  },
  packagePopularity: [
    { name: 'Premium Print + Digital', orders: 15, revenue: 3735 },
    { name: 'Digital Collection', orders: 12, revenue: 2388 },
    { name: 'Essentials Print Package', orders: 8, revenue: 712 },
    { name: 'Framed Collection', orders: 5, revenue: 1495 },
    { name: 'Canvas Portrait 16×20', orders: 4, revenue: 700 },
    { name: 'Wallet & Minis Pack', orders: 3, revenue: 135 }
  ],
  photoSelections: [
    { label: 'Pose 1', count: 34 },
    { label: 'Pose 3', count: 29 },
    { label: 'Pose 6', count: 27 },
    { label: 'Pose 2', count: 22 },
    { label: 'Pose 5', count: 19 },
    { label: 'Pose 4', count: 15 },
    { label: 'Pose 7', count: 12 },
    { label: 'Pose 8', count: 9 }
  ]
};

// Campaigns data
export const CAMPAIGNS = [
  {
    id: 'camp-001',
    name: 'Senior Gallery Now Live!',
    type: 'email',
    status: 'sent',
    sentDate: '2026-01-20',
    recipients: 156,
    openRate: 68,
    clickRate: 42,
    subject: 'Your senior portraits are ready to view!',
    previewText: 'Hi {parent_name}, {student_name}\'s senior portraits from Lincoln High are now available...'
  },
  {
    id: 'camp-002',
    name: 'Last Chance — Archive in 3 Days',
    type: 'email',
    status: 'scheduled',
    sentDate: '2026-04-27',
    recipients: 109,
    openRate: null,
    clickRate: null,
    subject: 'Don\'t miss out — your photos archive in 3 days',
    previewText: 'Hi {parent_name}, {student_name}\'s senior portraits will be archived on April 30th...'
  },
  {
    id: 'camp-003',
    name: 'Gallery Reminder — SMS',
    type: 'sms',
    status: 'sent',
    sentDate: '2026-02-01',
    recipients: 156,
    openRate: 95,
    clickRate: 61,
    subject: null,
    previewText: 'ChoicePix: {student_name}\'s senior photos are ready! View now: {gallery_link}'
  }
];

export const AI_SUBJECT_LINES = [
  'Your senior portraits are waiting — don\'t let them expire',
  '{student_name}\'s best moments, captured forever',
  'Last chance: Senior photos archive this week',
  'Parents love these packages — see what\'s popular',
  'A gift they\'ll treasure: Senior portrait packages from $45'
];

// Notifications for admin bell
export const NOTIFICATIONS = [
  { id: 'n-001', text: 'New order: Allanah Mendoza — Premium Print + Digital ($249)', time: '2 hours ago', read: false },
  { id: 'n-002', text: 'Gallery expiring: Lincoln High Seniors — 49 days remaining', time: '1 day ago', read: false },
  { id: 'n-003', text: 'Campaign sent: "Senior Gallery Now Live!" — 68% open rate', time: '2 days ago', read: false },
  { id: 'n-004', text: 'New order: Marcus Rivera — Digital Collection ($199)', time: '3 hours ago', read: true },
  { id: 'n-005', text: 'Milestone: $12,000 revenue on Lincoln High Seniors', time: '3 days ago', read: true }
];
