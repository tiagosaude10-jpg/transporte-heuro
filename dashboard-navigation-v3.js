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
    dashboard.style.display = 'none';

    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => {
      view.classList.add('hidden');
      view.style.display = 'none';
    });

    listView.classList.remove('hidden');
    listView.style.display = 'block';
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

  function replaceSummaryCards() {
    const grid = document.querySelector('.summary-grid');
    if (!grid || grid.dataset.nativeButtons === '1') return;

    const oldCards = [...grid.querySelectorAll('.summary-item')];
    if (oldCards.length !== 4) return;

    oldCards.forEach((oldCard, index) => {
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
      button.onclick = openListView;
      button.addEventListener('touchstart', (event) => {
        event.preventDefault();
        openListView();
      }, { passive: false });
      oldCard.replaceWith(button);
    });

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
      homeButton.onclick = openHome;
    }

    if (requestedButton.dataset.nativeRequested !== '1') {
      requestedButton.dataset.nativeRequested = '1';
      requestedButton.dataset.nav = 'solicitados';
      requestedButton.setAttribute('aria-label', 'Abrir planilha dos solicitados');
      requestedButton.innerHTML = '<span>🚑</span>Solicitados';
      requestedButton.onclick = openListView;
      requestedButton.addEventListener('touchstart', (event) => {
        event.preventDefault();
        openListView();
      }, { passive: false });
    }
  }

  function install() {
    replaceSummaryCards();
    bindBottomNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }

  const observer = new MutationObserver(install);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setInterval(install, 1000);
})();
