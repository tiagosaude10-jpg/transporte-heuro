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

  function ensureStyles() {
    if (document.getElementById('companyWhatsappStyles')) return;
    const style = document.createElement('style');
    style.id = 'companyWhatsappStyles';
    style.textContent = `
      #companyWhatsappScreen{background:#f6f8fb;min-height:100vh;padding-bottom:105px}
      .company-whatsapp-header{background:linear-gradient(135deg,#0b67b4,#06469e);color:#fff;border-radius:0 0 34px 34px;padding:calc(24px + env(safe-area-inset-top)) 22px 28px}
      .company-whatsapp-header button{border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.12);color:#fff;border-radius:12px;padding:10px 13px;font-size:1rem}
      .company-whatsapp-header h2{margin:24px 0 5px;font-size:1.65rem}.company-whatsapp-header p{margin:0;color:#d8e9ff}
      .company-whatsapp-body{padding:20px 18px}.company-whatsapp-note{background:#eef6ff;border:1px solid #cfe3ff;border-radius:16px;padding:14px;color:#174a84;margin-bottom:18px;line-height:1.4}
      .company-whatsapp-form{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:18px;box-shadow:0 6px 20px rgba(27,67,122,.08)}
      .company-whatsapp-form label{display:block;font-weight:800;color:#172033;margin-bottom:18px}.company-whatsapp-form label small{display:block;font-weight:400;color:#667085;margin:5px 0 9px;line-height:1.35}
      .company-whatsapp-form input{width:100%;box-sizing:border-box;border:1px solid #cfd7e5;border-radius:13px;padding:14px;font-size:1rem;background:#fff;color:#172033}
      .company-whatsapp-form input:focus{outline:2px solid #8ec0ff;border-color:#0b67b4}
      .company-whatsapp-save{width:100%;border:0;border-radius:14px;padding:15px;background:#0b67b4;color:#fff;font-size:1rem;font-weight:800}
      .company-whatsapp-status{margin-top:14px;border-radius:13px;padding:12px;text-align:center;font-weight:700;display:none}.company-whatsapp-status.success{display:block;background:#ecfdf3;color:#087443;border:1px solid #b7ebcc}.company-whatsapp-status.error{display:block;background:#fff1f2;color:#b42318;border:1px solid #fecdd3}
    `;
    document.head.appendChild(style);
  }

  function ensureCompanyWhatsappScreen() {
    if (document.getElementById('companyWhatsappScreen')) return;
    ensureStyles();
    const screen = document.createElement('section');
    screen.id = 'companyWhatsappScreen';
    screen.className = 'screen';
    screen.innerHTML = `
      <header class="company-whatsapp-header">
        <button type="button" id="companyWhatsappBack">← Voltar</button>
        <h2>WhatsApp da Empresa</h2>
        <p>Cadastro dos números de envio</p>
      </header>
      <div class="company-whatsapp-body">
        <div class="company-whatsapp-note"><strong>Envio automático.</strong><br>O aplicativo escolherá o número correto de acordo com o tipo de ambulância selecionado na solicitação.</div>
        <form id="companyWhatsappForm" class="company-whatsapp-form">
          <label>WhatsApp — Transporte Básico
            <small>Receberá as solicitações marcadas como Suporte básico.</small>
            <input id="companyWhatsappBasic" inputmode="numeric" autocomplete="tel" placeholder="Ex.: 69999999999" required>
          </label>
          <label>WhatsApp — Transporte UTI
            <small>Receberá as solicitações marcadas como UTI.</small>
            <input id="companyWhatsappUti" inputmode="numeric" autocomplete="tel" placeholder="Ex.: 69999999999" required>
          </label>
          <button class="company-whatsapp-save" type="submit">Salvar números</button>
          <div id="companyWhatsappStatus" class="company-whatsapp-status" role="status"></div>
        </form>
      </div>`;
    document.getElementById('app')?.appendChild(screen);

    screen.querySelector('#companyWhatsappBack').addEventListener('click', () => {
      screen.classList.remove('active');
      const adminPanel = document.getElementById('adminPanelScreen');
      if (adminPanel) adminPanel.classList.add('active');
      window.scrollTo(0, 0);
    });

    screen.querySelector('#companyWhatsappForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const status = screen.querySelector('#companyWhatsappStatus');
      const session = currentSession();
      if (session?.profile !== 'administrador') {
        status.textContent = 'Apenas administradores podem alterar estes números.';
        status.className = 'company-whatsapp-status error';
        return;
      }
      const basic = digits(screen.querySelector('#companyWhatsappBasic').value);
      const uti = digits(screen.querySelector('#companyWhatsappUti').value);
      if (basic.length < 10 || basic.length > 13 || uti.length < 10 || uti.length > 13) {
        status.textContent = 'Informe os dois números corretamente, com DDD.';
        status.className = 'company-whatsapp-status error';
        return;
      }
      localStorage.setItem(BASIC_KEY, basic);
      localStorage.setItem(UTI_KEY, uti);
      localStorage.setItem(LEGACY_KEY, basic);
      const oldBasic = document.getElementById('whatsappNumber');
      const oldUti = document.getElementById('whatsappUtiNumber');
      if (oldBasic) oldBasic.value = basic;
      if (oldUti) oldUti.value = uti;
      status.textContent = 'Números da empresa cadastrados com sucesso.';
      status.className = 'company-whatsapp-status success';
    });
  }

  function openCompanyWhatsappScreen() {
    if (currentSession()?.profile !== 'administrador') {
      alert('Esta área é exclusiva para administradores.');
      return;
    }
    ensureCompanyWhatsappScreen();
    document.querySelectorAll('.screen').forEach((item) => item.classList.remove('active'));
    const screen = document.getElementById('companyWhatsappScreen');
    screen.querySelector('#companyWhatsappBasic').value = localStorage.getItem(BASIC_KEY) || localStorage.getItem(LEGACY_KEY) || '';
    screen.querySelector('#companyWhatsappUti').value = localStorage.getItem(UTI_KEY) || '';
    const status = screen.querySelector('#companyWhatsappStatus');
    status.textContent = '';
    status.className = 'company-whatsapp-status';
    screen.classList.add('active');
    window.scrollTo(0, 0);
  }

  function ensureAdminButton() {
    const adminPanel = document.getElementById('adminPanelScreen');
    if (!adminPanel || adminPanel.querySelector('[data-admin="company-whatsapp"]')) return;
    const settingsButton = adminPanel.querySelector('[data-admin="settings"]');
    const grid = settingsButton?.closest('.admin-grid');
    if (!grid) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'admin-card tone-green';
    button.dataset.admin = 'company-whatsapp';
    button.innerHTML = '<span class="icon">📱</span><span><strong>WhatsApp da Empresa</strong><small>Cadastrar números de envio</small></span>';
    grid.insertBefore(button, settingsButton);
    button.addEventListener('click', openCompanyWhatsappScreen);
  }

  function ensureSettingsFields() {
    const form = document.getElementById('settingsForm');
    const oldInput = document.getElementById('whatsappNumber');
    if (!form || !oldInput || document.getElementById('whatsappUtiNumber')) return;
    const oldLabel = oldInput.closest('label');
    if (oldLabel) oldLabel.firstChild.textContent = 'WhatsApp — Transporte básico';
    oldInput.value = localStorage.getItem(BASIC_KEY) || localStorage.getItem(LEGACY_KEY) || '';
    const utiLabel = document.createElement('label');
    utiLabel.textContent = 'WhatsApp — Transporte UTI';
    const utiInput = document.createElement('input');
    utiInput.id = 'whatsappUtiNumber';
    utiInput.inputMode = 'numeric';
    utiInput.placeholder = 'Ex.: 69999999999';
    utiInput.required = true;
    utiInput.value = localStorage.getItem(UTI_KEY) || '';
    utiLabel.appendChild(utiInput);
    const help = form.querySelector('.help');
    form.insertBefore(utiLabel, help || form.querySelector('button'));
  }

  function saveLegacySettings(event) {
    if (event.target?.id !== 'settingsForm') return;
    const basic = digits(document.getElementById('whatsappNumber')?.value);
    const uti = digits(document.getElementById('whatsappUtiNumber')?.value);
    if (basic) localStorage.setItem(BASIC_KEY, basic);
    if (uti) localStorage.setItem(UTI_KEY, uti);
    if (basic) localStorage.setItem(LEGACY_KEY, basic);
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
      alert(`O número do ${destinationLabel} ainda não foi cadastrado. Entre como administrador e acesse Mais > WhatsApp da Empresa.`);
      return;
    }
    window.open(`https://wa.me/${withBrazilCode(number)}?text=${encodeURIComponent(buildMessage(request))}`, '_blank');
  }

  document.addEventListener('submit', saveLegacySettings, true);
  document.addEventListener('click', routeWhatsapp, true);
  const observer = new MutationObserver(() => {
    ensureAdminButton();
    ensureSettingsFields();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  ensureCompanyWhatsappScreen();
  ensureAdminButton();
  ensureSettingsFields();
})();