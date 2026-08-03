(() => {
  'use strict';

  function openListView() {
    const home = document.getElementById('homeScreen');
    const dashboard = document.getElementById('dashboard');
    const listView = document.getElementById('listView');
    if (!home || !dashboard || !listView) return;

    dashboard.classList.add('hidden');
    dashboard.style.setProperty('display', 'none', 'important');
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => {
      view.classList.add('hidden');
      view.style.setProperty('display', 'none', 'important');
    });
    listView.classList.remove('hidden');
    listView.style.setProperty('display', 'block', 'important');

    try {
      if (typeof renderList === 'function') renderList();
    } catch (error) {
      console.error('Falha ao renderizar solicitações:', error);
    }
    window.scrollTo(0, 0);
  }

  function makeNativeSummaryButtons() {
    document.querySelectorAll('.summary-grid .summary-item:not([data-native-summary])').forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = item.className;
      button.innerHTML = item.innerHTML;
      button.dataset.nativeSummary = '1';
      button.style.width = '100%';
      button.style.font = 'inherit';
      button.style.cursor = 'pointer';
      button.style.touchAction = 'manipulation';
      button.style.webkitTapHighlightColor = 'transparent';
      button.addEventListener('click', openListView);
      item.replaceWith(button);
    });
  }

  function makeNativeSolicitadosButton() {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;
    const oldButton = nav.querySelectorAll(':scope > button')[1];
    if (!oldButton || oldButton.dataset.nativeSolicitados === '1') return;

    const button = oldButton.cloneNode(true);
    button.dataset.nativeSolicitados = '1';
    button.dataset.nav = 'solicitados';
    button.setAttribute('aria-label', 'Abrir planilha dos solicitados');
    const textNodes = [...button.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
    if (textNodes.length) textNodes[textNodes.length - 1].nodeValue = 'Solicitados';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openListView();
    });
    oldButton.replaceWith(button);
  }

  function install() {
    makeNativeSummaryButtons();
    makeNativeSolicitadosButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }

  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
})();
