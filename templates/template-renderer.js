// Template Renderer
// Takes a template definition + photo URL(s) and returns HTML
// Same definitions will drive server-side generation in the future

import { TEMPLATES } from './template-definitions.js';

export function renderTemplate(templateId, photoUrls, containerWidth = 300) {
  const tmpl = TEMPLATES[templateId];
  if (!tmpl) return '';

  const containerHeight = containerWidth / tmpl.aspect;
  const photos = Array.isArray(photoUrls) ? photoUrls : [photoUrls];

  let inner = '';

  // Render photo slots
  tmpl.slots.forEach((slot, i) => {
    const photoUrl = photos[i % photos.length] || photos[0];
    const slotStyle = [
      `position: absolute`,
      `left: ${slot.x * 100}%`,
      `top: ${slot.y * 100}%`,
      `width: ${slot.w * 100}%`,
      `height: ${slot.h * 100}%`,
      `overflow: hidden`,
    ].join(';');

    inner += `
      <div class="tmpl-slot" style="${slotStyle}">
        <img src="${photoUrl}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;">
      </div>`;
  });

  // Build layers based on template type
  const s = tmpl.style;
  let wrapperClasses = `tmpl tmpl-${tmpl.type}`;
  let wrapperStyle = [
    `position: relative`,
    `width: ${containerWidth}px`,
    `height: ${containerHeight}px`,
    `box-shadow: ${s.shadow}`,
    `border-radius: ${s.radius}`,
    `overflow: hidden`,
  ].join(';');

  let html = '';

  if (tmpl.type === 'frame' && s.frame) {
    // Frame = outer frame border + mat + photo
    const fw = s.frameWidth;
    const matW = s.matWidth;
    const floatGap = s.floatGap || '0px';

    html = `
      <div class="${wrapperClasses}" style="position:relative;width:${containerWidth}px;display:inline-block;">
        <div class="tmpl-frame-outer" style="
          background: ${s.frameColor};
          padding: ${fw};
          box-shadow: ${s.shadow};
          ${s.frameInset && s.frameInset !== 'none' ? `border: ${s.frameInset};` : ''}
        ">
          <div class="tmpl-frame-mat" style="
            background: ${s.matColor};
            padding: ${matW};
            ${floatGap !== '0px' ? `box-shadow: inset 0 0 0 ${floatGap} rgba(0,0,0,0.08);` : ''}
          ">
            <div class="tmpl-frame-photo" style="
              position: relative;
              width: 100%;
              aspect-ratio: ${tmpl.aspect};
              overflow: hidden;
            ">
              ${inner}
            </div>
          </div>
        </div>
      </div>`;

  } else if (tmpl.type === 'canvas' && s.wrapEdge) {
    // Canvas = photo with edge wrap illusion
    html = `
      <div class="${wrapperClasses}" style="position:relative;width:${containerWidth}px;display:inline-block;">
        <div class="tmpl-canvas-wrap" style="
          position: relative;
          box-shadow: ${s.shadow};
        ">
          <div class="tmpl-canvas-photo" style="
            position: relative;
            width: 100%;
            aspect-ratio: ${tmpl.aspect};
            overflow: hidden;
          ">
            ${inner}
          </div>
          <div class="tmpl-canvas-edge-right" style="
            position: absolute;
            top: 0; right: -${s.wrapWidth}; bottom: 0;
            width: ${s.wrapWidth};
            background: ${s.wrapColor};
            transform: skewY(-2deg);
            transform-origin: top left;
          "></div>
          <div class="tmpl-canvas-edge-bottom" style="
            position: absolute;
            bottom: -${s.wrapWidth}; left: 0; right: 0;
            height: ${s.wrapWidth};
            background: ${s.wrapColor};
            transform: skewX(-2deg);
            transform-origin: top left;
          "></div>
        </div>
      </div>`;

  } else if (tmpl.type === 'digital' && s.overlay) {
    // Digital = photo with subtle download overlay icon
    html = `
      <div class="${wrapperClasses}" style="${wrapperStyle}">
        ${inner}
        <div class="tmpl-digital-overlay" style="
          position: absolute;
          bottom: 8px; right: 8px;
          width: 32px; height: 32px;
          background: rgba(0,0,0,0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" style="width:16px;height:16px">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
      </div>`;

  } else if (tmpl.type === 'wall-set') {
    // Wall set = background "wall" with multiple framed photos
    const wallStyle = [
      `position: relative`,
      `width: ${containerWidth}px`,
      `height: ${containerHeight}px`,
      `border-radius: ${s.radius}`,
      `overflow: hidden`,
      `background: ${s.background}`,
    ].join(';');

    let framesHtml = '';
    tmpl.slots.forEach((slot, i) => {
      const photoUrl = photos[i % photos.length] || photos[0];
      const frameW = slot.w * containerWidth;
      const frameH = slot.h * containerHeight;
      framesHtml += `
        <div style="
          position: absolute;
          left: ${slot.x * 100}%;
          top: ${slot.y * 100}%;
          width: ${slot.w * 100}%;
          height: ${slot.h * 100}%;
        ">
          <div style="
            background: #1a1a1a;
            padding: 3px;
            height: 100%;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          ">
            <div style="background:#fff;padding:8%;height:100%;box-sizing:border-box;">
              <img src="${photoUrl}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;">
            </div>
          </div>
        </div>`;
    });

    html = `
      <div class="${wrapperClasses}" style="${wallStyle}">
        <div class="tmpl-wall-texture" style="
          position:absolute;inset:0;
          background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%);
        "></div>
        ${framesHtml}
      </div>`;

  } else {
    // Default: print, wallet, collage — simple container with slots
    if (s.padding && s.padding !== '0') {
      wrapperStyle += `;padding: ${s.padding}; background: ${s.background || '#fff'}`;
    } else if (s.background && s.background !== 'none') {
      wrapperStyle += `;background: ${s.background}`;
    }
    if (s.border && s.border !== 'none') {
      wrapperStyle += `;border: ${s.border}`;
    }

    html = `
      <div class="${wrapperClasses}" style="${wrapperStyle}">
        <div style="position:relative;width:100%;height:100%;">
          ${inner}
        </div>
      </div>`;
  }

  return html;
}

// Render a small thumbnail version
export function renderThumbnail(templateId, photoUrl, size = 80) {
  return renderTemplate(templateId, photoUrl, size);
}

// Get all template IDs
export function getTemplateIds() {
  return Object.keys(TEMPLATES);
}
