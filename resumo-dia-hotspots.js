(() => {
  'use strict';

  const CONFIG = {
    birthDate: { type: 'date', help: 'Digite a data ou selecione no calendário', label: 'Data de nascimento' },
    transportDate: { type: 'date', help: 'Digite a data ou selecione no calendário', label: 'Data do transporte' },
    transportTime: { type: 'time', help: 'Digite o horário ou selecione no relógio', label: 'Horário previsto' }
  };

  function iconSvg(type) {
    return type === 'time'
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5l3.5 2"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2"></rect><path d="M8 3.5v4M16 3.5v4M4 9.5h16"></path><rect x="8" y="12" width="3" height="3" rx=".5"></rect></svg>';
  }

  function addStyles() {
    if (document.getElementById('heuro-date-time-style')) return;
    const style = document.createElement('style');
    style.id = 'heuro-date-time-style';
    style.textContent = `
      .heuro-date-field{display:block!important;width:100%!important;min-width:0!important;margin:0!important}
      .heuro-date-label{display:block;margin:0 0 8px;font-weight:700;color:#14233f}
      .heuro-date-control{position:relative;display:flex;align-items:center;width:100%;min-width:0;height:58px;border:1.5px solid #cbd7e7;border-radius:18px;background:#fff;overflow:hidden;box-sizing:border-box}
      .heuro-date-control input{display:block!important;position:relative!important;inset:auto!important;width:100%!important;min-width:0!important;height:100%!important;margin:0!important;padding:0 104px 0 20px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;font:inherit!important;font-size:1rem!important;color:#14233f!important;box-sizing:border-box!important;opacity:1!important;z-index:1!important}
      .heuro-date-control input:focus{outline:none}
      .heuro-date-control:focus-within{border-color:#1768ad;box-shadow:0 0 0 3px rgba(23,104,173,.12)}
      .heuro-date-control input::-webkit-calendar-picker-indicator{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
      .heuro-date-action{position:absolute;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:42px;height:42px;padding:0;border:0;background:transparent;color:#687b96;z-index:3;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      .heuro-date-action.clear{right:48px;font-size:34px;font-weight:300;line-height:1}
      .heuro-date-action.picker{right:7px}
      .heuro-date-action svg{width:27px;height:27px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
      .heuro-date-help{display:block;margin:7px 0 0;color:#677791;font-size:.86rem;line-height:1.25}
      @media(max-width:390px){.heuro-date-control{height:56px}.heuro-date-control input{padding-left:16px!important;padding-right:98px!important}.heuro-date-action{width:40px;height:40px}.heuro-date-action.clear{right:44px}.heuro-date-action.picker{right:4px}}
    `;
    document.head.appendChild(style);
  }

  function openPicker(input) {
    try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
    if (typeof input.showPicker === 'function') {
      try { input.showPicker(); return; } catch (_) {}
    }
    input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    input.click();
  }

  function rebuild(id, config) {
    const input = document.getElementById(id);
    if (!input || input.dataset.heuroDateReady === '1') return;
    const oldLabel = input.closest('label');
    if (!oldLabel) return;

    const wrapper = document.createElement('label');
    wrapper.className = 'heuro-date-field';
    wrapper.setAttribute('for', id);

    const title = document.createElement('span');
    title.className = 'heuro-date-label';
    title.textContent = config.label;

    const control = document.createElement('span');
    control.className = 'heuro-date-control';

    input.type = config.type;
    input.dataset.heuroDateReady = '1';
    input.setAttribute('aria-label', config.label);
    input.setAttribute('autocomplete', 'off');

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'heuro-date-action clear';
    clear.setAttribute('aria-label', `Limpar ${config.label.toLowerCase()}`);
    clear.textContent = '×';
    clear.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const picker = document.createElement('button');
    picker.type = 'button';
    picker.className = 'heuro-date-action picker';
    picker.setAttribute('aria-label', config.type === 'time' ? 'Abrir relógio' : 'Abrir calendário');
    picker.innerHTML = iconSvg(config.type);
    picker.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPicker(input);
    });

    const help = document.createElement('small');
    help.className = 'heuro-date-help';
    help.textContent = config.help;

    control.append(input, clear, picker);
    wrapper.append(title, control, help);
    oldLabel.replaceWith(wrapper);
  }

  function install() {
    addStyles();
    Object.entries(CONFIG).forEach(([id, config]) => rebuild(id, config));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
