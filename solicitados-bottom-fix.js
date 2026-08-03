(() => {
  'use strict';

  function openSolicitados(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    }

    const home = document.getElementById('homeScreen');
    const dashboard = document.getElementById('dashboard');
    const listView = document.getElementById('listView');
    if (!home || !dashboard || !listView) return;

    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    home.classList.add('active');
    document.getElementById('adminPanelScreen')?.classList.remove('active');

    dashboard.classList.add('hidden');
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => view.classList.add('hidden'));
    listView.classList.remove('hidden');

    try {
      if (typeof window.renderList === 'function') window.renderList();
      else if (typeof renderList === 'function') renderList();
    } catch (error) {
      console.error('Falha ao renderizar solicitações:', error);
    }

    window.scrollTo(0, 0);
  }

  function install() {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;

    const button = nav.querySelector('button:nth-of-type(2)');
    if (!button || button.dataset.solicitadosFixed === '1') return;

    button.dataset.solicitadosFixed = '1';
    button.dataset.nav = 'solicitados';
    button.id = 'bottomSolicitados';
    button.setAttribute('aria-label', 'Abrir planilha dos solicitados');
    button.innerHTML = '<span>🚑</span>Solicitados';
    button.style.position = 'relative';
    button.style.zIndex = '2001';
    button.style.pointerEvents = 'auto';
    button.style.touchAction = 'manipulation';

    button.onclick = openSolicitados;
    button.addEventListener('pointerdown', openSolicitados, true);
    button.addEventListener('touchstart', openSolicitados, { capture: true, passive: false });
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#bottomSolicitados')) return;
    openSolicitados(event);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }

  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(install, 800);
})();
