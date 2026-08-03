(() => {
  'use strict';

  const FIELDS = [
    { id: 'birthDate', label: 'Data de nascimento', type: 'date', help: 'Digite a data ou selecione no calendário' },
    { id: 'transportDate', label: 'Data do transporte', type: 'date', help: 'Digite a data ou selecione no calendário' },
    { id: 'transportTime', label: 'Horário previsto', type: 'time', help: 'Digite o horário ou selecione no relógio' }
  ];

  const calendarIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.2"></rect>
      <path d="M8 3v4M16 3v4M3.5 9h17"></path>
      <rect x="8" y="12" width="3.2" height="3.2" rx=".5"></rect>
    </svg>`;

  const clockIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 7v5l3.5 2"></path>
    </svg>`;

  function addStyles() {
    let style = document.getElementById('request-date-time-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'request-date-time-style';
      document.head.appendChild(style);
    }

    style.textContent = `
      .rdt-field{
        display:block!important;
        width:100%!important;
        min-width:0!important;
        margin:0 0 15px!important;
      }
      .rdt-label{
        display:block!important;
        margin:0 0 7px!important;
        font-weight:700!important;
        color:#14233f!important;
      }
      .rdt-control{
        position:relative!important;
        display:flex!important;
        align-items:center!important;
        width:100%!important;
        min-width:0!important;
        height:58px!important;
        margin:0!important;
        border:1.5px solid #cbd7e7!important;
        border-radius:18px!important;
        background:#fff!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      .rdt-control:focus-within{
        border-color:#1768ad!important;
        box-shadow:0 0 0 3px rgba(23,104,173,.12)!important;
      }
      .rdt-input{
        position:relative!important;
        display:block!important;
        width:100%!important;
        min-width:0!important;
        height:100%!important;
        margin:0!important;
        padding:0 104px 0 20px!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        box-shadow:none!important;
        box-sizing:border-box!important;
        color:#14233f!important;
        font:inherit!important;
        font-size:1rem!important;
        line-height:normal!important;
        opacity:1!important;
        appearance:none!important;
        -webkit-appearance:none!important;
        z-index:1!important;
      }
      .rdt-input:focus{outline:none!important}
      .rdt-input::-webkit-date-and-time-value{text-align:left!important}
      .rdt-input::-webkit-calendar-picker-indicator{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
        margin:0!important;
        padding:0!important;
        opacity:0!important;
        pointer-events:none!important;
      }
      .rdt-action{
        position:absolute!important;
        top:50%!important;
        transform:translateY(-50%)!important;
        display:grid!important;
        place-items:center!important;
        width:42px!important;
        height:42px!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:10px!important;
        background:#fff!important;
        color:#687b96!important;
        z-index:10!important;
        pointer-events:auto!important;
        touch-action:manipulation!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      .rdt-clear{right:49px!important;font-size:34px!important;font-weight:300!important;line-height:1!important}
      .rdt-picker{right:7px!important}
      .rdt-picker svg{
        width:27px!important;
        height:27px!important;
        fill:none!important;
        stroke:currentColor!important;
        stroke-width:2!important;
        stroke-linecap:round!important;
        stroke-linejoin:round!important;
        pointer-events:none!important;
      }
      .rdt-help{
        display:block!important;
        margin:7px 0 0!important;
        color:#677791!important;
        font-size:.86rem!important;
        font-weight:400!important;
        line-height:1.25!important;
      }
      @media(max-width:460px){
        .rdt-field{grid-column:1/-1!important}
        .rdt-control{height:58px!important}
        .rdt-input{padding-left:16px!important;padding-right:98px!important;font-size:16px!important}
        .rdt-clear{right:45px!important}
        .rdt-picker{right:4px!important}
      }
    `;
  }

  function openNativePicker(input) {
    input.focus({ preventScroll: true });
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch (_) {}
    }
    input.click();
  }

  function clearPreviousStructure(input) {
    const currentField = input.closest('.rdt-field');
    if (!currentField) return input.closest('label');

    const parent = currentField.parentNode;
    if (!parent) return null;

    const originalLabel = document.createElement('label');
    originalLabel.appendChild(input);
    parent.replaceChild(originalLabel, currentField);
    input.classList.remove('rdt-input');
    delete input.dataset.rdtReady;
    return originalLabel;
  }

  function buildField({ id, label, type, help }) {
    const input = document.getElementById(id);
    if (!input) return;

    if (input.dataset.rdtReady === '2' && input.closest('.rdt-field')) return;

    let oldLabel = input.closest('label');
    if (input.closest('.rdt-field')) oldLabel = clearPreviousStructure(input);
    if (!oldLabel) return;

    const field = document.createElement('label');
    field.className = 'rdt-field';
    field.htmlFor = id;

    const title = document.createElement('span');
    title.className = 'rdt-label';
    title.textContent = label;

    const control = document.createElement('span');
    control.className = 'rdt-control';

    input.type = type;
    input.classList.add('rdt-input');
    input.dataset.rdtReady = '2';
    input.setAttribute('aria-label', label);
    input.setAttribute('autocomplete', 'off');

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'rdt-action rdt-clear';
    clearButton.textContent = '×';
    clearButton.setAttribute('aria-label', `Limpar ${label.toLowerCase()}`);
    clearButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus({ preventScroll: true });
    });

    const pickerButton = document.createElement('button');
    pickerButton.type = 'button';
    pickerButton.className = 'rdt-action rdt-picker';
    pickerButton.innerHTML = type === 'time' ? clockIcon : calendarIcon;
    pickerButton.setAttribute('aria-label', type === 'time' ? 'Abrir relógio' : 'Abrir calendário');
    pickerButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openNativePicker(input);
    });

    const helpText = document.createElement('small');
    helpText.className = 'rdt-help';
    helpText.textContent = help;

    control.append(input, clearButton, pickerButton);
    field.append(title, control, helpText);
    oldLabel.replaceWith(field);
  }

  function install() {
    addStyles();
    FIELDS.forEach(buildField);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();