(() => {
  'use strict';

  const fields = [
    ['birthDate', 'Data de nascimento', 'date', 'DD/MM/AAAA', 'Digite a data ou selecione no calendário'],
    ['transportDate', 'Data do transporte', 'date', 'DD/MM/AAAA', 'Digite a data ou selecione no calendário'],
    ['transportTime', 'Horário previsto', 'time', 'HH:MM', 'Digite o horário ou selecione no relógio']
  ];

  const icons = {
    date: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 9h16"></path><rect x="8" y="12" width="3" height="3" rx=".5"></rect></svg>',
    time: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>'
  };

  function ensureStyle() {
    let style = document.getElementById('request-date-time-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'request-date-time-style';
      document.head.appendChild(style);
    }
    style.textContent = `
      #requestForm .rdt-field{display:block!important;grid-column:auto!important;width:100%!important;max-width:100%!important;min-width:0!important;margin:0 0 15px!important;box-sizing:border-box!important;overflow:visible!important}
      #requestForm .rdt-label{display:block!important;margin:0 0 7px!important;font-weight:700!important;color:#14233f!important}
      #requestForm .rdt-control{position:relative!important;display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;height:58px!important;margin:0!important;border:1.5px solid #cbd7e7!important;border-radius:18px!important;background:#fff!important;box-sizing:border-box!important;overflow:hidden!important}
      #requestForm .rdt-control:focus-within{border-color:#1768ad!important;box-shadow:0 0 0 3px rgba(23,104,173,.12)!important}
      #requestForm .rdt-visible{position:absolute!important;inset:0!important;display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;height:100%!important;margin:0!important;padding:0 104px 0 20px!important;border:0!important;border-radius:0!important;background:#fff!important;box-shadow:none!important;box-sizing:border-box!important;color:#14233f!important;font:inherit!important;font-size:16px!important;outline:none!important;z-index:1!important}
      #requestForm .rdt-visible::placeholder{color:#a9a9a9!important;opacity:1!important}
      #requestForm .rdt-clear,#requestForm .rdt-picker{position:absolute!important;top:50%!important;transform:translateY(-50%)!important;display:grid!important;place-items:center!important;width:42px!important;height:42px!important;padding:0!important;margin:0!important;border:0!important;border-radius:10px!important;background:#fff!important;color:#687b96!important;z-index:30!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
      #requestForm .rdt-clear{right:49px!important;font-size:34px!important;font-weight:300!important;line-height:1!important}
      #requestForm .rdt-picker{right:7px!important}
      #requestForm .rdt-picker svg{width:27px!important;height:27px!important;fill:none!important;stroke:currentColor!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important;pointer-events:none!important}
      #requestForm .rdt-native{position:absolute!important;right:7px!important;top:50%!important;transform:translateY(-50%)!important;width:42px!important;height:42px!important;min-width:42px!important;margin:0!important;padding:0!important;border:0!important;border-radius:10px!important;opacity:.001!important;z-index:40!important;cursor:pointer!important}
      #requestForm .rdt-native::-webkit-calendar-picker-indicator{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;opacity:1!important;cursor:pointer!important}
      #requestForm .rdt-help{display:block!important;margin:7px 0 0!important;color:#677791!important;font-size:.86rem!important;font-weight:400!important;line-height:1.25!important}
      @media(max-width:460px){
        #requestForm .rdt-field{grid-column:auto!important}
        #requestForm .rdt-control{height:58px!important}
        #requestForm .rdt-visible{padding-left:16px!important;padding-right:98px!important}
        #requestForm .rdt-clear{right:45px!important}
        #requestForm .rdt-picker,#requestForm .rdt-native{right:4px!important}
      }
    `;
  }

  const isoToBr = value => {
    if (!value) return '';
    const [y,m,d] = String(value).split('-');
    return y && m && d ? `${d}/${m}/${y}` : '';
  };
  const maskDate = value => {
    const d = String(value || '').replace(/\D/g,'').slice(0,8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0,2)}/${d.slice(2)}`;
    return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
  };
  const dateToIso = value => {
    const d = String(value || '').replace(/\D/g,'');
    if (d.length !== 8) return '';
    const day=d.slice(0,2), month=d.slice(2,4), year=d.slice(4,8);
    const test = new Date(`${year}-${month}-${day}T12:00:00`);
    return !Number.isNaN(test.getTime()) && test.getDate()===Number(day) && test.getMonth()+1===Number(month) && test.getFullYear()===Number(year) ? `${year}-${month}-${day}` : '';
  };
  const maskTime = value => {
    const d=String(value||'').replace(/\D/g,'').slice(0,4);
    return d.length<=2 ? d : `${d.slice(0,2)}:${d.slice(2)}`;
  };
  const validTime = value => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '';

  function build(id,label,type,placeholder,help) {
    const native = document.getElementById(id);
    if (!native || native.dataset.rdtReady === 'final') return;
    const oldLabel = native.closest('label');
    if (!oldLabel) return;

    const field = document.createElement('label');
    field.className = 'rdt-field';
    const title = document.createElement('span');
    title.className = 'rdt-label';
    title.textContent = label;
    const control = document.createElement('span');
    control.className = 'rdt-control';
    const visible = document.createElement('input');
    visible.type = 'text';
    visible.className = 'rdt-visible';
    visible.inputMode = 'numeric';
    visible.autocomplete = 'off';
    visible.placeholder = placeholder;
    visible.value = type === 'date' ? isoToBr(native.value) : native.value;

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'rdt-clear';
    clear.textContent = '×';
    clear.setAttribute('aria-label', `Limpar ${label.toLowerCase()}`);
    const picker = document.createElement('span');
    picker.className = 'rdt-picker';
    picker.innerHTML = icons[type];

    native.type = type;
    native.className = 'rdt-native';
    native.dataset.rdtReady = 'final';
    native.setAttribute('aria-label', type === 'time' ? 'Abrir relógio' : 'Abrir calendário');

    visible.addEventListener('input', () => {
      visible.value = type === 'date' ? maskDate(visible.value) : maskTime(visible.value);
      native.value = type === 'date' ? dateToIso(visible.value) : validTime(visible.value);
      native.dispatchEvent(new Event('input',{bubbles:true}));
    });
    visible.addEventListener('blur', () => { if (visible.value && !native.value) visible.value=''; });
    native.addEventListener('change', () => { visible.value = type === 'date' ? isoToBr(native.value) : native.value; });
    clear.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation();
      visible.value=''; native.value='';
      native.dispatchEvent(new Event('input',{bubbles:true}));
      native.dispatchEvent(new Event('change',{bubbles:true}));
    });

    control.append(visible,clear,picker,native);
    const helpNode=document.createElement('small');
    helpNode.className='rdt-help'; helpNode.textContent=help;
    field.append(title,control,helpNode);
    oldLabel.replaceWith(field);
  }

  function install() {
    ensureStyle();
    fields.forEach(args => build(...args));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();

  const requestView = document.getElementById('requestView');
  if (requestView) new MutationObserver(install).observe(requestView,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('pageshow',install);
})();