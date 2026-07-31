(() => {
  const byId = (id) => document.getElementById(id);
  const registerScreen = byId('registerScreen');
  const detailsScreen = byId('registerDetailsScreen');
  const loginScreen = byId('loginScreen');
  const continueButton = byId('continueRegister');
  const backButton = byId('registerDetailsBack');
  const form = byId('registerForm');
  const choiceMessage = byId('profileChoiceMessage');
  const selectedLabel = byId('selectedProfileLabel');
  const selectedText = byId('selectedProfileText');

  const labels = {
    solicitante: 'Solicitante de transporte',
    transporte: 'Executante de transporte',
    administrador: 'Administrador'
  };

  function activateOnly(screen) {
    document.querySelectorAll('.screen').forEach((item) => item.classList.remove('active'));
    screen.classList.add('active');
    window.scrollTo(0, 0);
  }

  function clearChoiceMessage() {
    choiceMessage.textContent = '';
    choiceMessage.className = 'form-message';
  }

  document.querySelectorAll('input[name="profileChoice"]').forEach((input) => {
    input.addEventListener('change', clearChoiceMessage);
  });

  continueButton.addEventListener('click', () => {
    const choice = document.querySelector('input[name="profileChoice"]:checked');
    if (!choice) {
      choiceMessage.textContent = 'Selecione uma das três opções para continuar.';
      choiceMessage.className = 'form-message error';
      return;
    }

    const profileInput = document.querySelector(`input[name="registerProfile"][value="${choice.value}"]`);
    if (profileInput) profileInput.checked = true;
    selectedLabel.textContent = labels[choice.value];
    selectedText.textContent = `Cadastro para ${labels[choice.value]}. Preencha seus dados.`;
    activateOnly(detailsScreen);
  });

  backButton.addEventListener('click', () => activateOnly(registerScreen));

  form.addEventListener('submit', () => {
    setTimeout(() => {
      if (detailsScreen.classList.contains('active')) {
        detailsScreen.classList.remove('active');
        loginScreen.classList.add('active');
        window.scrollTo(0, 0);
      }
    }, 1100);
  });
})();

(() => {
  const style = document.createElement('style');
  style.textContent = `
    #dashboard.role-dashboard{display:block;padding-bottom:22px}
    .dashboard-section-title{margin:2px 2px 12px;font-size:1.08rem;color:#172033}
    .role-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .role-module-card{position:relative;min-height:132px;border:1px solid #e7ebf2;border-radius:18px;background:#f8faff;padding:16px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;box-shadow:0 5px 16px rgba(27,67,122,.06);color:#172033}
    .role-module-card strong{font-size:.96rem;line-height:1.15}
    .role-module-card small{font-size:.73rem;line-height:1.2;color:#657086}
    .role-module-card .module-icon{font-size:2rem;line-height:1}
    .role-module-card.module-blue .module-icon{color:#075ec7}
    .role-module-card.module-orange .module-icon{color:#ff7a13}
    .role-module-card.module-green .module-icon{color:#20aa69}
    .role-module-card.module-purple .module-icon{color:#7149b8}
    .role-module-card.module-red .module-icon{color:#e33b45}
    .role-module-card.module-teal .module-icon{color:#079e9e}
    .role-module-card.is-locked{background:#f1f2f4;border-color:#e3e4e7;color:#8a8f98;box-shadow:none;filter:grayscale(1)}
    .role-module-card.is-locked small{color:#9a9ea5}
    .role-module-card .lock-mark{position:absolute;right:10px;top:9px;font-size:.82rem;background:#777f8c;color:#fff;border-radius:999px;padding:4px 6px;filter:none}
    .role-module-card .badge{position:absolute;right:10px;top:9px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:#ef3f45;color:white;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800}
    .role-module-card .badge.hidden{display:none}
    .daily-summary{margin-top:22px}
    .summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .summary-item{border-radius:15px;padding:13px 14px;background:#f3f7ff;border:1px solid #e7edf8}
    .summary-item span{display:block;font-size:.72rem;color:#667085;margin-bottom:4px}
    .summary-item strong{font-size:1.35rem;color:#172033}
    .permission-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(30px);width:min(90%,420px);background:#172033;color:#fff;padding:14px 16px;border-radius:14px;box-shadow:0 12px 34px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:.22s;z-index:9999;text-align:center;font-size:.9rem}
    .permission-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
    @media(min-width:760px){.role-card-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.summary-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
  `;
  document.head.appendChild(style);

  const modules = [
    { id:'newRequestCard', title:'Nova solicitação', subtitle:'Registrar pedido de transporte', icon:'▤', color:'blue', profiles:['administrador','solicitante'], view:'request' },
    { id:'transportCard', title:'Transportes', subtitle:'Consultar e acompanhar pedidos', icon:'▣', color:'blue', profiles:['administrador','solicitante','transporte'], view:'list' },
    { id:'pendingTransportCard', title:'Solicitações pendentes', subtitle:'Pedidos aguardando andamento', icon:'◷', color:'orange', profiles:['administrador','transporte'], view:'list' },
    { id:'usersCard', title:'Aprovar cadastros', subtitle:'Autorizar novos acessos', icon:'♟', color:'red', profiles:['administrador'], view:'users', badge:'pendingBadge' },
    { id:'userManagementCard', title:'Usuários', subtitle:'Perfis, acessos e bloqueios', icon:'♟', color:'green', profiles:['administrador'], placeholder:true },
    { id:'fleetCard', title:'Frota e ambulâncias', subtitle:'Veículos e disponibilidade', icon:'▰', color:'purple', profiles:['administrador'], placeholder:true },
    { id:'teamsCard', title:'Equipes e profissionais', subtitle:'Motoristas e equipes', icon:'♟', color:'teal', profiles:['administrador'], placeholder:true },
    { id:'agendaCard', title:'Agenda de transportes', subtitle:'Programação diária e mensal', icon:'▦', color:'purple', profiles:['administrador'], placeholder:true },
    { id:'reportsCard', title:'Relatórios', subtitle:'Indicadores e resultados', icon:'▥', color:'blue', profiles:['administrador'], placeholder:true },
    { id:'settingsCard', title:'Configurações', subtitle:'WhatsApp e parâmetros', icon:'⚙', color:'orange', profiles:['administrador'], view:'settings' },
    { id:'auditCard', title:'Auditoria e histórico', subtitle:'Registro das ações do sistema', icon:'◆', color:'orange', profiles:['administrador'], placeholder:true },
    { id:'backupCard', title:'Backup e armazenamento', subtitle:'Cópias e sincronização', icon:'☁', color:'green', profiles:['administrador'], placeholder:true }
  ];

  let renderedProfile = '';
  let toastTimer;

  function getSession(){
    try { return JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); }
    catch { return null; }
  }

  function getRequests(){
    try { return JSON.parse(localStorage.getItem('heuroRequests') || '[]'); }
    catch { return []; }
  }

  function getUsers(){
    try { return JSON.parse(localStorage.getItem('heuroUsers') || '[]'); }
    catch { return []; }
  }

  function showToast(message){
    let toast = document.getElementById('permissionToast');
    if(!toast){
      toast = document.createElement('div');
      toast.id = 'permissionToast';
      toast.className = 'permission-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function summaryData(profile){
    const data = getRequests();
    const today = new Date().toISOString().slice(0,10);
    const visible = profile === 'solicitante'
      ? data.filter(item => item.requesterId === getSession()?.id || item.requester === getSession()?.name)
      : data;
    const todayCount = visible.filter(item => item.transportDate === today).length;
    const completed = visible.filter(item => String(item.status).toLowerCase().includes('conclu')).length;
    const inProgress = visible.filter(item => String(item.status).toLowerCase().includes('andamento')).length;
    const pending = Math.max(0, visible.length - completed - inProgress);
    return { todayCount, completed, inProgress, pending };
  }

  function renderDashboard(force=false){
    const home = document.getElementById('homeScreen');
    const dashboard = document.getElementById('dashboard');
    const active = home?.classList.contains('active');
    const current = getSession();
    if(!active || !dashboard || !current) return;
    if(!force && renderedProfile === current.profile && dashboard.classList.contains('role-dashboard')) return;
    renderedProfile = current.profile;

    const cards = modules.map(module => {
      const allowed = module.profiles.includes(current.profile);
      return `<button id="${module.id}" type="button" class="role-module-card module-${module.color}${allowed ? '' : ' is-locked'}" data-module="${module.id}" data-allowed="${allowed}" ${module.view ? `data-target-view="${module.view}"` : ''} ${module.placeholder ? 'data-placeholder="true"' : ''}>
        <span class="module-icon">${module.icon}</span>
        <strong>${module.title}</strong>
        <small>${module.subtitle}</small>
        ${allowed ? '' : '<span class="lock-mark" aria-hidden="true">🔒</span>'}
        ${module.badge ? `<span id="${module.badge}" class="badge hidden">0</span>` : ''}
      </button>`;
    }).join('');

    const summary = summaryData(current.profile);
    dashboard.className = 'role-dashboard';
    dashboard.innerHTML = `
      <h3 class="dashboard-section-title">Ações rápidas</h3>
      <div class="role-card-grid">${cards}</div>
      <section class="daily-summary">
        <h3 class="dashboard-section-title">Resumo do dia</h3>
        <div class="summary-grid">
          <div class="summary-item"><span>Transportes de hoje</span><strong>${summary.todayCount}</strong></div>
          <div class="summary-item"><span>Em andamento</span><strong>${summary.inProgress}</strong></div>
          <div class="summary-item"><span>Pendentes</span><strong>${summary.pending}</strong></div>
          <div class="summary-item"><span>Concluídos</span><strong>${summary.completed}</strong></div>
        </div>
      </section>`;

    dashboard.querySelectorAll('[data-module]').forEach(button => {
      button.addEventListener('click', () => {
        if(button.dataset.allowed !== 'true'){
          showToast('Seu perfil não possui permissão para acessar este módulo.');
          return;
        }
        if(button.dataset.placeholder === 'true'){
          showToast('Módulo já reservado no painel administrativo e em fase de estruturação.');
          return;
        }
        const view = button.dataset.targetView;
        if(view && typeof window.showView === 'function') window.showView(`${view}View`);
      });
    });

    const pending = getUsers().filter(user => user.status === 'aguardando').length;
    const badge = document.getElementById('pendingBadge');
    if(badge){
      badge.textContent = pending;
      badge.classList.toggle('hidden', pending === 0 || current.profile !== 'administrador');
    }
  }

  const observer = new MutationObserver(() => renderDashboard());
  const home = document.getElementById('homeScreen');
  if(home) observer.observe(home, { attributes:true, attributeFilter:['class'] });

  document.addEventListener('click', event => {
    if(event.target.closest('#logoutButton')) renderedProfile = '';
  });

  window.addEventListener('storage', () => renderDashboard(true));
  setTimeout(() => renderDashboard(true), 200);
})();