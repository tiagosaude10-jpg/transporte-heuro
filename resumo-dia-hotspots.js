(() => {
  'use strict';

  function renderListSafe() {
    try {
      if (typeof window.renderList === 'function') window.renderList();
      else if (typeof renderList === 'function') renderList();
    } catch (error) {
      console.error('Falha ao renderizar solicitações', error);
    }
  }

  function openListView() {
    const home = document.getElementById('homeScreen');
    const dashboard = document.getElementById('dashboard');
    const listView = document.getElementById('listView');
    if (!home || !dashboard || !listView) return;

    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    home.classList.add('active');
    dashboard.classList.add('hidden');
    dashboard.style.setProperty('display', 'none', 'important');

    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => {
      view.classList.add('hidden');
      view.style.setProperty('display', 'none', 'important');
    });

    listView.classList.remove('hidden');
    listView.style.setProperty('display', 'block', 'important');
    renderListSafe();
    window.scrollTo(0, 0);
  }

  function openHome() {
    const home = document.getElementById('homeScreen');
    const dashboard = document.getElementById('dashboard');
    if (!home || !dashboard) return;

    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    home.classList.add('active');
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => {
      view.classList.add('hidden');
      view.style.removeProperty('display');
    });
    dashboard.classList.remove('hidden');
    dashboard.style.removeProperty('display');
    window.scrollTo(0, 0);
  }

  function makeNativeButton(oldCard) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = oldCard.className;
    button.innerHTML = oldCard.innerHTML;
    button.setAttribute('aria-label', `Abrir ${oldCard.textContent.trim()}`);
    button.style.width = '100%';
    button.style.font = 'inherit';
    button.style.cursor = 'pointer';
    button.style.touchAction = 'manipulation';
    button.style.webkitTapHighlightColor = 'transparent';
    button.addEventListener('click', openListView);
    button.addEventListener('touchstart', (event) => {
      event.preventDefault();
      openListView();
    }, { passive: false });
    return button;
  }

  function replaceSummaryCards() {
    const grid = document.querySelector('.summary-grid');
    if (!grid || grid.dataset.nativeButtons === '1') return;
    const cards = [...grid.querySelectorAll('.summary-item')];
    if (cards.length !== 4) return;
    cards.forEach((card) => card.replaceWith(makeNativeButton(card)));
    grid.dataset.nativeButtons = '1';
  }

  function bindBottomNav() {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;
    const buttons = [...nav.querySelectorAll(':scope > button')];
    if (buttons.length < 2) return;

    const homeButton = buttons[0];
    const requestedButton = buttons[1];

    if (homeButton.dataset.nativeHome !== '1') {
      homeButton.dataset.nativeHome = '1';
      homeButton.addEventListener('click', openHome, true);
    }

    if (requestedButton.dataset.nativeRequested !== '1') {
      requestedButton.dataset.nativeRequested = '1';
      requestedButton.dataset.nav = 'solicitados';
      requestedButton.setAttribute('aria-label', 'Abrir planilha dos solicitados');
      requestedButton.innerHTML = '<span>🚑</span>Solicitados';
      requestedButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openListView();
      }, true);
      requestedButton.addEventListener('touchstart', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openListView();
      }, { capture: true, passive: false });
    }
  }

  function install() {
    replaceSummaryCards();
    bindBottomNav();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();

  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(install, 800);
})();
