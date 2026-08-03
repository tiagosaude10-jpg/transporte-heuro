(() => {
  'use strict';

  let lastActivation = 0;

  function showViewDirect(viewId) {
    const home = document.getElementById('homeScreen');
    const dashboard = document.getElementById('dashboard');
    const target = document.getElementById(viewId);
    if (!home || !target) return false;

    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    home.classList.add('active');

    dashboard?.classList.add('hidden');
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => view.classList.add('hidden'));
    target.classList.remove('hidden');

    if (viewId === 'listView') {
      try {
        if (typeof window.renderList === 'function') window.renderList();
        else if (typeof renderList === 'function') renderList();
      } catch (error) {
        console.error('Falha ao atualizar a lista de solicitações:', error);
      }
    }

    window.scrollTo(0, 0);
    return true;
  }

  function showDashboard() {
    const home = document.getElementById('homeScreen');
    const dashboard = document.getElementById('dashboard');
    if (!home || !dashboard) return;
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    home.classList.add('active');
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => view.classList.add('hidden'));
    dashboard.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  function activateAction(action) {
    const now = Date.now();
    if (now - lastActivation < 350) return;
    lastActivation = now;

    switch (action) {
      case 'home':
        showDashboard();
        break;
      case 'confirmed':
      case 'analysis':
      case 'pending':
      case 'completed':
      case 'solicitados':
        showViewDirect('listView');
        break;
      case 'notifications':
        alert('Central de notificações em estruturação.');
        break;
      case 'profile': {
        let session = null;
        try { session = JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); } catch (_) {}
        alert(session ? `${session.name}\n${session.profile}` : 'Perfil do usuário');
        break;
      }
      case 'more': {
        let session = null;
        try { session = JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); } catch (_) {}
        if (session?.profile === 'administrador') showViewDirect('usersView');
        else alert('Esta área é exclusiva para administradores.');
        break;
      }
    }
  }

  function summaryAction(element) {
    const item = element?.closest?.('.summary-grid .summary-item');
    if (!item) return null;
    const items = [...item.parentElement.querySelectorAll('.summary-item')];
    return ['confirmed', 'analysis', 'pending', 'completed'][items.indexOf(item)] || null;
  }

  function bottomAction(element) {
    const button = element?.closest?.('#bottomNav button');
    if (!button) return null;
    const buttons = [...button.parentElement.querySelectorAll(':scope > button')];
    return ['home', 'solicitados', 'notifications', 'profile', 'more'][buttons.indexOf(button)] || null;
  }

  function resolveAction(target) {
    return summaryAction(target) || bottomAction(target);
  }

  function route(event) {
    const action = resolveAction(event.target);
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    activateAction(action);
  }

  document.addEventListener('pointerup', route, true);
  document.addEventListener('click', route, true);
  document.addEventListener('touchend', route, { capture: true, passive: false });

  function prepare() {
    document.querySelectorAll('.summary-grid .summary-item').forEach((item, index) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.style.cursor = 'pointer';
      item.style.touchAction = 'manipulation';
      item.dataset.summaryAction = ['confirmed', 'analysis', 'pending', 'completed'][index] || '';
    });

    const nav = document.getElementById('bottomNav');
    const buttons = nav ? [...nav.querySelectorAll(':scope > button')] : [];
    if (buttons[1]) {
      buttons[1].dataset.nav = 'solicitados';
      buttons[1].setAttribute('aria-label', 'Abrir planilha dos solicitados');
      buttons[1].style.touchAction = 'manipulation';
      const textNode = [...buttons[1].childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.nodeValue = 'Solicitados';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepare, { once: true });
  else prepare();

  new MutationObserver(prepare).observe(document.documentElement, { childList: true, subtree: true });
})();
