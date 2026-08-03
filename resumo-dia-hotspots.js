(() => {
  'use strict';

  const MARK = 'data-resumo-hotspot-ready';

  function openList() {
    const dashboard = document.getElementById('dashboard');
    const listView = document.getElementById('listView');
    if (!listView) return;

    dashboard?.classList.add('hidden');
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => view.classList.add('hidden'));
    listView.classList.remove('hidden');
    try {
      if (typeof window.renderList === 'function') window.renderList();
      else if (typeof renderList === 'function') renderList();
    } catch (_) {}
    window.scrollTo(0, 0);
  }

  function activate(label) {
    const text = String(label || '').trim().toLowerCase();

    if (text.includes('confirm')) {
      const agenda = document.querySelector('[data-home-action="agenda"], #agendaCardVisual, #cmdAgenda');
      if (agenda) agenda.click();
      else openList();
      return;
    }

    if (text.includes('conclu')) {
      const history = document.querySelector('[data-home-action="history"], #historyCardVisual, #cmdHistory');
      if (history) history.click();
      else openList();
      return;
    }

    if (text.includes('pendent')) {
      const pending = document.querySelector('[data-home-action="pending"], #pendingCardVisual, #cmdPending');
      if (pending) pending.click();
      else openList();
      return;
    }

    // “Em análise” / “Solicitados”: consulta da planilha sem alterar status.
    openList();
  }

  function makeClickable(item) {
    if (!item || item.hasAttribute(MARK)) return;
    item.setAttribute(MARK, '1');
    item.style.position = 'relative';

    const label = item.querySelector('span')?.textContent || item.textContent || '';
    const overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.className = 'resumo-dia-hotspot';
    overlay.setAttribute('aria-label', `Abrir ${label.trim()}`);
    overlay.style.cssText = [
      'position:absolute',
      'inset:0',
      'width:100%',
      'height:100%',
      'z-index:50',
      'margin:0',
      'padding:0',
      'border:0',
      'border-radius:inherit',
      'background:rgba(0,0,0,0.001)',
      'appearance:none',
      '-webkit-appearance:none',
      'touch-action:manipulation',
      '-webkit-tap-highlight-color:transparent',
      'pointer-events:auto'
    ].join(';');

    const run = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      activate(label);
    };

    overlay.addEventListener('click', run, true);
    overlay.addEventListener('pointerup', run, true);
    overlay.addEventListener('touchend', run, { capture: true, passive: false });
    item.appendChild(overlay);
  }

  function bindSummaryCards() {
    document.querySelectorAll('.summary-grid .summary-item').forEach(makeClickable);
  }

  function bindSolicitadosBottom() {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;
    const button = nav.querySelector('[data-nav="solicitados"], [data-nav="transports"]') || nav.querySelectorAll('button')[1];
    if (!button || button.dataset.overlaySolicitados === '1') return;

    button.dataset.overlaySolicitados = '1';
    button.dataset.nav = 'solicitados';
    button.style.position = 'relative';

    const overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.setAttribute('aria-label', 'Abrir planilha dos solicitados');
    overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:60;margin:0;padding:0;border:0;background:rgba(0,0,0,0.001);appearance:none;-webkit-appearance:none;touch-action:manipulation;';
    const run = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      openList();
    };
    overlay.addEventListener('click', run, true);
    overlay.addEventListener('pointerup', run, true);
    overlay.addEventListener('touchend', run, { capture: true, passive: false });
    button.appendChild(overlay);
  }

  function install() {
    bindSummaryCards();
    bindSolicitadosBottom();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();

  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
})();
