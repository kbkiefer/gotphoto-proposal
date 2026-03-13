// Product Template Definitions
// Each template defines photo slots and decorative layers
// Future: these same definitions drive server-side image generation

export const TEMPLATES = {

  // ─── PRINTS ────────────────────────────────────────────
  'print-8x10': {
    id: 'print-8x10',
    name: '8×10 Print',
    type: 'print',
    aspect: 4 / 5,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '5%',
      background: '#ffffff',
      border: 'none',
      shadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
      radius: '2px',
    }
  },

  'print-5x7': {
    id: 'print-5x7',
    name: '5×7 Print',
    type: 'print',
    aspect: 5 / 7,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '5%',
      background: '#ffffff',
      border: 'none',
      shadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
      radius: '2px',
    }
  },

  'print-11x14': {
    id: 'print-11x14',
    name: '11×14 Print',
    type: 'print',
    aspect: 11 / 14,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '4%',
      background: '#ffffff',
      border: 'none',
      shadow: '0 6px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
      radius: '2px',
    }
  },

  // ─── WALLETS ───────────────────────────────────────────
  'wallet-sheet': {
    id: 'wallet-sheet',
    name: 'Wallet Prints',
    type: 'wallet',
    aspect: 8.5 / 11,
    slots: [
      { x: 0.04, y: 0.03, w: 0.44, h: 0.22 },
      { x: 0.52, y: 0.03, w: 0.44, h: 0.22 },
      { x: 0.04, y: 0.27, w: 0.44, h: 0.22 },
      { x: 0.52, y: 0.27, w: 0.44, h: 0.22 },
      { x: 0.04, y: 0.51, w: 0.44, h: 0.22 },
      { x: 0.52, y: 0.51, w: 0.44, h: 0.22 },
      { x: 0.04, y: 0.75, w: 0.44, h: 0.22 },
      { x: 0.52, y: 0.75, w: 0.44, h: 0.22 },
    ],
    style: {
      padding: '0',
      background: '#ffffff',
      border: '1px dashed #d1d5db',
      shadow: '0 2px 12px rgba(0,0,0,0.08)',
      radius: '4px',
    }
  },

  // ─── CANVAS ────────────────────────────────────────────
  'canvas-16x20': {
    id: 'canvas-16x20',
    name: 'Canvas 16×20',
    type: 'canvas',
    aspect: 4 / 5,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '0',
      background: 'none',
      border: 'none',
      shadow: '8px 8px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.15)',
      radius: '0',
      wrapEdge: true,
      wrapWidth: '14px',
      wrapColor: 'rgba(0,0,0,0.25)',
    }
  },

  'canvas-square': {
    id: 'canvas-square',
    name: 'Canvas Square',
    type: 'canvas',
    aspect: 1,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '0',
      background: 'none',
      border: 'none',
      shadow: '8px 8px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.15)',
      radius: '0',
      wrapEdge: true,
      wrapWidth: '14px',
      wrapColor: 'rgba(0,0,0,0.25)',
    }
  },

  // ─── FRAMES ────────────────────────────────────────────
  'frame-classic': {
    id: 'frame-classic',
    name: 'Classic Frame',
    type: 'frame',
    aspect: 4 / 5,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '0',
      background: 'none',
      border: 'none',
      shadow: '0 8px 40px rgba(0,0,0,0.2)',
      radius: '0',
      frame: true,
      frameWidth: '12px',
      frameColor: '#3d2b1f',
      frameInset: '2px solid #5c4033',
      matWidth: '10%',
      matColor: '#f5f0e8',
    }
  },

  'frame-modern': {
    id: 'frame-modern',
    name: 'Modern Frame',
    type: 'frame',
    aspect: 4 / 5,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '0',
      background: 'none',
      border: 'none',
      shadow: '0 8px 40px rgba(0,0,0,0.18)',
      radius: '0',
      frame: true,
      frameWidth: '4px',
      frameColor: '#1a1a1a',
      frameInset: 'none',
      matWidth: '14%',
      matColor: '#ffffff',
    }
  },

  'frame-float': {
    id: 'frame-float',
    name: 'Float Frame',
    type: 'frame',
    aspect: 4 / 5,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '0',
      background: 'none',
      border: 'none',
      shadow: '0 8px 40px rgba(0,0,0,0.2)',
      radius: '0',
      frame: true,
      frameWidth: '3px',
      frameColor: '#c4a882',
      frameInset: 'none',
      matWidth: '6%',
      matColor: '#ffffff',
      floatGap: '4px',
    }
  },

  // ─── COLLAGE ───────────────────────────────────────────
  'collage-3up': {
    id: 'collage-3up',
    name: '3-Photo Collage',
    type: 'collage',
    aspect: 3 / 2,
    slots: [
      { x: 0.01, y: 0.02, w: 0.48, h: 0.96 },
      { x: 0.51, y: 0.02, w: 0.48, h: 0.47 },
      { x: 0.51, y: 0.51, w: 0.48, h: 0.47 },
    ],
    style: {
      padding: '0',
      background: '#ffffff',
      border: 'none',
      shadow: '0 4px 24px rgba(0,0,0,0.12)',
      radius: '4px',
      gap: '3px',
    }
  },

  'collage-grid4': {
    id: 'collage-grid4',
    name: '4-Photo Grid',
    type: 'collage',
    aspect: 1,
    slots: [
      { x: 0.01, y: 0.01, w: 0.48, h: 0.48 },
      { x: 0.51, y: 0.01, w: 0.48, h: 0.48 },
      { x: 0.01, y: 0.51, w: 0.48, h: 0.48 },
      { x: 0.51, y: 0.51, w: 0.48, h: 0.48 },
    ],
    style: {
      padding: '0',
      background: '#ffffff',
      border: 'none',
      shadow: '0 4px 24px rgba(0,0,0,0.12)',
      radius: '4px',
      gap: '3px',
    }
  },

  // ─── DIGITAL ───────────────────────────────────────────
  'digital-download': {
    id: 'digital-download',
    name: 'Digital Download',
    type: 'digital',
    aspect: 3 / 4,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    style: {
      padding: '0',
      background: 'none',
      border: 'none',
      shadow: '0 2px 16px rgba(0,0,0,0.1)',
      radius: '8px',
      overlay: true,
      overlayIcon: 'download',
    }
  },

  // ─── FRAMED SETS ───────────────────────────────────────
  'wall-set-3': {
    id: 'wall-set-3',
    name: 'Wall Set (3 Frames)',
    type: 'wall-set',
    aspect: 16 / 9,
    slots: [
      { x: 0.08, y: 0.08, w: 0.35, h: 0.84 },
      { x: 0.47, y: 0.2, w: 0.24, h: 0.6 },
      { x: 0.74, y: 0.08, w: 0.2, h: 0.5 },
    ],
    style: {
      padding: '0',
      background: '#f0ece4',
      border: 'none',
      shadow: 'none',
      radius: '8px',
      wallTexture: true,
      frameStyle: 'modern',
    }
  },
};

// Map package IDs to their default template
export const PACKAGE_TEMPLATES = {
  'pkg-001': ['digital-download'],
  'pkg-002': ['print-8x10', 'print-5x7', 'wallet-sheet'],
  'pkg-003': ['print-8x10', 'print-5x7', 'print-11x14', 'wallet-sheet', 'digital-download'],
  'pkg-004': ['canvas-16x20'],
  'pkg-005': ['frame-classic', 'frame-modern', 'wall-set-3'],
  'pkg-006': ['wallet-sheet'],
  'pkg-007': [],
};

// Get templates for a given package
export function getTemplatesForPackage(packageId) {
  const ids = PACKAGE_TEMPLATES[packageId] || [];
  return ids.map(id => TEMPLATES[id]).filter(Boolean);
}
