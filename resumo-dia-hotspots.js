(() => {
  'use strict';

  function renderRequestsIfAvailable() {
    try {
      if (typeof window.renderList === 'function') window.renderList();
      else if (typeof renderList === 'function') renderList();
    } catch (error) {
      console.error('Falha ao renderizar solicitações:', error);
    }
  }

  function openContentView(viewId) {
    const home = document.getElementById('homeScreen');
    const dashboard = document.getElementById('dashboard');
    const target = document.getElementById(viewId);
    if (!home || !dashboard || !target) return;

    dashboard.classList.add('hidden');
    dashboard.style.setProperty('display', 'none', 'important');

    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => {
      view.classList.add('hidden');
      view.style.setProperty('display', 'none', 'important');
    });

    target.classList.remove('hidden');
    target.style.setProperty('display', 'block', 'important');

    if (viewId === 'listView') renderRequestsIfAvailable();
    window.scrollTo(0, 0);
  }

  function openDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => {
      view.classList.add('hidden');
      view.style.removeProperty('display');
    });

    dashboard.classList.remove('hidden');
    dashboard.style.removeProperty('display');
    window.scrollTo(0, 0);
  }

  function runAction(action) {
    switch (action) {
      case 'home': openDashboard(); break;
      case 'confirmed':
      case 'analysis':
      case 'pending':
      case 'completed':
      case 'solicitados': openContentView('listView'); break;
      case 'notifications': alert('Central de notificações em estruturação.'); break;
      case 'profile': {
        let active = null;
        try { active = JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); } catch (_) {}
        alert(active ? `${active.name}\n${active.profile}` : 'Perfil do usuário');
        break;
      }
      case 'more': {
        let active = null;
        try { active = JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); } catch (_) {}
        if (active?.profile === 'administrador') openContentView('usersView');
        else alert('Esta área é exclusiva para administradores.');
        break;
      }
    }
  }

  function bindElement(element, action) {
    if (!element || element.dataset.directActionBound === '1') return;
    element.dataset.directActionBound = '1';
    element.dataset.directAction = action;
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.style.setProperty('cursor', 'pointer');
    element.style.setProperty('touch-action', 'manipulation');
    element.style.setProperty('pointer-events', 'auto', 'important');

    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      runAction(action);
    }, true);

    element.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      runAction(action);
    });
  }

  function install() {
    const cards = [...document.querySelectorAll('.summary-grid .summary-item')];
    ['confirmed', 'analysis', 'pending', 'completed'].forEach((action, index) => bindElement(cards[index], action));

    const nav = document.getElementById('bottomNav');
    const buttons = nav ? [...nav.querySelectorAll(':scope > button')] : [];
    ['home', 'solicitados', 'notifications', 'profile', 'more'].forEach((action, index) => bindElement(buttons[index], action));

    if (buttons[1]) {
      buttons[1].dataset.nav = 'solicitados';
      buttons[1].setAttribute('aria-label', 'Abrir planilha dos solicitados');
      const textNodes = [...buttons[1].childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
      if (textNodes.length) textNodes[textNodes.length - 1].nodeValue = 'Solicitados';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();

  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
})();
