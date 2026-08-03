(() => {
  'use strict';

  const FIELDS = [
    { id: 'birthDate', label: 'Data de nascimento', type: 'date', placeholder: 'DD/MM/AAAA', help: 'Digite a data ou selecione no calendário' },
    { id: 'transportDate', label: 'Data do transporte', type: 'date', placeholder: 'DD/MM/AAAA', help: 'Digite a data ou selecione no calendário' },
    { id: 'transportTime', label: 'Horário previsto', type: 'time', placeholder: 'HH:MM', help: 'Digite o horário ou selecione no relógio' }
  ];

  const calendarIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.2"></rect><path d="M8 3v4M16 3v4M3.5 9h17"></path><rect x="8" y="12" width="3.2" height="3.2" rx=".5"></rect></svg>';
  const clockIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path></svg>';

  function addStyles() {
    let style = document.getElementById('request-date-time-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'request-date-time-style';
      document.head.appendChild(style);
    }
    style.textContent = `
      .rdt-field{display:block!important;width:100%!important;min-width:0!important;margin:0 0 15px!important;box-sizing:border-box!important}
      .rdt-label{display:block!important;margin:0 0 7px!important;font-weight:700!important;color:#14233f!important}
      .rdt-control{position:relative!important;display:flex!important;align-items:center!important;width:100%!important;min-width:0!important;height:58px!important;margin:0!important;border:1.5px solid #cbd7e7!important;border-radius:18px!important;background:#fff!important;overflow:hidden!important;box-sizing:border-box!important}
      .rdt-control:focus-within{border-color:#1768ad!important;box-shadow:0 0 0 3px rgba(23,104,173,.12)!important}
      .rdt-visible{display:block!important;width:100%!important;min-width:0!important;height:100%!important;margin:0!important;padding:0 104px 0 20px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;box-sizing:border-box!important;color:#14233f!important;font:inherit!important;font-size:16px!important;line-height:normal!important;outline:none!important}
      .rdt-visible::placeholder{color:#a7a7a7!important;opacity:1!important}
      .rdt-action{position:absolute!important;top:50%!important;transform:translateY(-50%)!important;display:grid!important;place-items:center!important;width:42px!important;height:42px!important;margin:0!important;padding:0!important;border:0!important;border-radius:10px!important;background:#fff!important;color:#687b96!important;z-index:5!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
      .rdt-clear{right:49px!important;font-size:34px!important;font-weight:300!important;line-height:1!important}
      .rdt-picker{right:7px!important}
      .rdt-picker svg{width:27px!important;height:27px!important;fill:none!important;stroke:currentColor!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important;pointer-events:none!important}
      .rdt-native{position:absolute!important;right:7px!important;top:50%!important;transform:translateY(-50%)!important;width:42px!important;height:42px!important;margin:0!important;padding:0!important;border:0!important;opacity:0!important;z-index:8!important;cursor:pointer!important}
      .rdt-native::-webkit-calendar-picker-indicator{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;opacity:0!important;cursor:pointer!important}
      .rdt-help{display:block!important;margin:7px 0 0!important;color:#677791!important;font-size:.86rem!important;font-weight:400!important;line-height:1.25!important}
      @media(max-width:460px){.rdt-control{height:58px!important}.rdt-visible{padding-left:16px!important;padding-right:98px!important}.rdt-clear{right:45px!important}.rdt-picker,.rdt-native{right:4px!important}}
    `;
  }

  function isoToBr(value) {
    if (!value) return '';
    const [year, month, day] = String(value).split('-');
    return year && month && day ? `${day}/${month}/${year}` : '';
  }

  function brToIso(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length !== 8) return '';
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    const date = new Date(`${year}-${month}-${day}T12:00:00`);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day)) return '';
    return `${year}-${month}-${day}`;
  }

  function maskDate(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function maskTime(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  function validTime(value) {
    const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
    if (!match) return '';
    return Number(match[1]) < 24 && Number(match[2]) < 60 ? value : '';
  }

  function buildField(config) {
    const native = document.getElementById(config.id);
    if (!native || native.dataset.rdtReady === '3') return;
    const oldLabel = native.closest('label');
    if (!oldLabel) return;

    const field = document.createElement('label');
    field.className = 'rdt-field';
    field.htmlFor = `${config.id}Visible`;

    const title = document.createElement('span');
    title.className = 'rdt-label';
    title.textContent = config.label;

    const control = document.createElement('span');
    control.className = 'rdt-control';

    const visible = document.createElement('input');
    visible.id = `${config.id}Visible`;
    visible.type = 'text';
    visible.className = 'rdt-visible';
    visible.inputMode = 'numeric';
    visible.autocomplete = 'off';
    visible.placeholder = config.placeholder;
    visible.value = config.type === 'date' ? isoToBr(native.value) : native.value;

    native.type = config.type;
    native.className = 'rdt-native';
    native.dataset.rdtReady = '3';
    native.setAttribute('aria-label', config.type === 'time' ? 'Abrir relógio' : 'Abrir calendário');

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'rdt-action rdt-clear';
    clearButton.textContent = '×';
    clearButton.setAttribute('aria-label', `Limpar ${config.label.toLowerCase()}`);

    const icon = document.createElement('span');
    icon.className = 'rdt-action rdt-picker';
    icon.innerHTML = config.type === 'time' ? clockIcon : calendarIcon;
    icon.setAttribute('aria-hidden', 'true');

    const help = document.createElement('small');
    help.className = 'rdt-help';
    help.textContent = config.help;

    visible.addEventListener('input', () => {
      if (config.type === 'date') {
        visible.value = maskDate(visible.value);
        native.value = brToIso(visible.value);
      } else {
        visible.value = maskTime(visible.value);
        native.value = validTime(visible.value);
      }
      native.dispatchEvent(new Event('input', { bubbles: true }));
    });

    visible.addEventListener('blur', () => {
      if (visible.value && !native.value) visible.value = '';
    });

    native.addEventListener('change', () => {
      visible.value = config.type === 'date' ? isoToBr(native.value) : native.value;
      native.dispatchEvent(new Event('input', { bubbles: true }));
    });

    clearButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      visible.value = '';
      native.value = '';
      native.dispatchEvent(new Event('input', { bubbles: true }));
      native.dispatchEvent(new Event('change', { bubbles: true }));
      visible.focus({ preventScroll: true });
    });

    control.append(visible, clearButton, icon, native);
    field.append(title, control, help);
    oldLabel.replaceWith(field);
  }

  function install() {
    addStyles();
    FIELDS.forEach(buildField);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();