(() => {
  const BASIC_KEY = 'heuroWhatsappBasic';
  const UTI_KEY = 'heuroWhatsappUti';
  const LEGACY_KEY = 'heuroWhatsapp';

  const digits = (value) => String(value || '').replace(/\D/g, '');
  const withBrazilCode = (value) => {
    const number = digits(value);
    return number.startsWith('55') ? number : `55${number}`;
  };

  function currentSession() {
    try {
      return JSON.parse(sessionStorage.getItem('heuroSession') || 'null');
    } catch {
      return null;
    }
  }

  function getRequests() {
    try {
      return JSON.parse(localStorage.getItem('heuroRequests') || '[]');
    } catch {
      return [];
    }
  }

  function formatDate(value) {
    if (!value) return 'Não informado';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  function locationText(request) {
    return request.boxNumber
      ? `Box: ${request.boxNumber}`
      : `Enfermaria: ${request.ward || 'Não informada'}\nLeito: ${request.bed || 'Não informado'}`;
  }

  function buildMessage(request) {
    return `*SOLICITAÇÃO DE TRANSPORTE HEURO*\n\nProtocolo: ${request.protocol}\nPaciente: ${request.patient}\nSetor de origem: ${request.originSector || request.origin || 'Não informado'}\n${locationText(request)}\nDestino: ${request.destination}\nData: ${formatDate(request.transportDate)} às ${request.transportTime}\nAmbulância: ${request.ambulanceType}\nPrioridade: ${request.priority}\nOxigênio: ${request.oxygen}\nDocumento: ${request.attachmentName}\nObservações: ${request.notes || 'Sem observações'}\n\nSolicitação registrada no aplicativo Transporte HEURO.`;
  }

  function isUtiRequest(request) {
    return String(request?.ambulanceType || '').trim().toLowerCase() === 'uti';
  }

  function configuredNumberFor(request) {
    if (isUtiRequest(request)) return localStorage.getItem(UTI_KEY) || '';
    return localStorage.getItem(BASIC_KEY) || localStorage.getItem(LEGACY_KEY) || '';
  }

  function findVisibleRequest() {
    const protocol = document.querySelector('#detailContent .eyebrow.dark')?.textContent?.trim();
    if (!protocol) return null;
    return getRequests().find((item) => item.protocol === protocol) || null;
  }

  function ensureSettingsFields() {
    const form = document.getElementById('settingsForm');
    const oldInput = document.getElementById('whatsappNumber');
    if (!form || !oldInput || document.getElementById('whatsappUtiNumber')) return;

    const heading = document.querySelector('#settingsView h3');
    if (heading) heading.textContent = 'Números do transporte';

    const description = document.querySelector('#settingsView .section-head .eyebrow');
    if (description) description.textContent = 'Configuração administrativa';

    const oldLabel = oldInput.closest('label');
    if (oldLabel) {
      oldLabel.firstChild.textContent = 'WhatsApp — Transporte básico';
    }
    oldInput.placeholder = 'Ex.: 69999999999';
    oldInput.setAttribute('aria-label', 'WhatsApp do transporte básico');
    oldInput.required = true;
    oldInput.value = localStorage.getItem(BASIC_KEY) || localStorage.getItem(LEGACY_KEY) || '';

    const utiLabel = document.createElement('label');
    utiLabel.textContent = 'WhatsApp — Transporte UTI';
    const utiInput = document.createElement('input');
    utiInput.id = 'whatsappUtiNumber';
    utiInput.inputMode = 'numeric';
    utiInput.placeholder = 'Ex.: 69999999999';
    utiInput.setAttribute('aria-label', 'WhatsApp do transporte UTI');
    utiInput.required = true;
    utiInput.value = localStorage.getItem(UTI_KEY) || '';
    utiLabel.appendChild(utiInput);

    const help = form.querySelector('.help');
    form.insertBefore(utiLabel, help || form.querySelector('button'));
    if (help) help.textContent = 'Informe somente números com DDD. O sistema adiciona o código do Brasil automaticamente e escolhe o destino conforme o tipo de ambulância.';

    const saveButton = form.querySelector('button[type="submit"]');
    if (saveButton) saveButton.textContent = 'Salvar números';
  }

  function saveNumbers(event) {
    const form = event.target;
    if (form?.id !== 'settingsForm') return;

    const session = currentSession();
    if (session?.profile !== 'administrador') {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert('Apenas administradores podem alterar os números do transporte.');
      return;
    }

    const basic = digits(document.getElementById('whatsappNumber')?.value);
    const uti = digits(document.getElementById('whatsappUtiNumber')?.value);

    if (basic.length < 10 || basic.length > 13 || uti.length < 10 || uti.length > 13) {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert('Informe números válidos, com DDD, para o transporte básico e para a UTI.');
      return;
    }

    localStorage.setItem(BASIC_KEY, basic);
    localStorage.setItem(UTI_KEY, uti);
    localStorage.setItem(LEGACY_KEY, basic);
  }

  function routeWhatsapp(event) {
    const button = event.target.closest('#whatsappButton');
    if (!button) return;

    const request = findVisibleRequest();
    if (!request) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const number = configuredNumberFor(request);
    const destinationLabel = isUtiRequest(request) ? 'UTI' : 'transporte básico';

    if (!number) {
      alert(`O número do ${destinationLabel} ainda não foi cadastrado. Entre como administrador e acesse Mais > Configurações.`);
      return;
    }

    window.open(`https://wa.me/${withBrazilCode(number)}?text=${encodeURIComponent(buildMessage(request))}`, '_blank');
  }

  document.addEventListener('submit', saveNumbers, true);
  document.addEventListener('click', routeWhatsapp, true);

  const observer = new MutationObserver(() => ensureSettingsFields());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  ensureSettingsFields();
})();
