// GotPhoto App System Proposal — Slide Navigation & Interactions

(function() {
  'use strict';

  const state = {
    current: 0,
    total: 0,
    transitioning: false
  };

  const slides = [];
  let progressFill, counter;

  function init() {
    document.querySelectorAll('.slide').forEach((s, i) => {
      slides.push(s);
      s.dataset.index = i;
    });
    state.total = slides.length;

    progressFill = document.querySelector('.nav-progress-fill');
    counter = document.querySelector('.nav-counter');

    // Set first slide active
    goTo(0, false);

    // Keyboard navigation
    document.addEventListener('keydown', handleKey);

    // Button navigation
    document.querySelector('.nav-prev').addEventListener('click', prev);
    document.querySelector('.nav-next').addEventListener('click', next);

    // Touch/swipe
    let touchStartX = 0;
    let touchStartY = 0;
    document.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        dx < 0 ? next() : prev();
      }
    }, { passive: true });

    // URL hash
    const hash = parseInt(location.hash.replace('#', ''), 10);
    if (hash >= 0 && hash < state.total) {
      goTo(hash, false);
    }
  }

  function handleKey(e) {
    switch(e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prev();
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(state.total - 1);
        break;
    }
  }

  function next() {
    if (state.current < state.total - 1) goTo(state.current + 1);
  }

  function prev() {
    if (state.current > 0) goTo(state.current - 1);
  }

  function goTo(index, animate = true) {
    if (state.transitioning && animate) return;
    if (index < 0 || index >= state.total) return;

    const prevIndex = state.current;
    state.current = index;

    slides.forEach((s, i) => {
      s.classList.remove('active', 'prev');
      if (i === index) {
        s.classList.add('active');
      } else if (i < index) {
        s.classList.add('prev');
      }
    });

    // Update progress
    const pct = ((index) / (state.total - 1)) * 100;
    progressFill.style.width = pct + '%';
    counter.textContent = (index + 1) + ' / ' + state.total;

    // Update buttons
    document.querySelector('.nav-prev').disabled = index === 0;
    document.querySelector('.nav-next').disabled = index === state.total - 1;

    // URL hash
    history.replaceState(null, '', '#' + index);

    if (animate) {
      state.transitioning = true;
      setTimeout(() => { state.transitioning = false; }, 500);
    }
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
