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

  document.querySelectorAll('input[name="profileChoice"]').forEach((input) => input.addEventListener('change', clearChoiceMessage));

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
      if (detailsScreen.classList.contains('active')) activateOnly(loginScreen);
    }, 1100);
  });
})();

(() => {
  const style = document.createElement('style');
  style.textContent = `
    #homeScreen{padding-bottom:92px}
    #dashboard.official-dashboard{display:block;padding:18px 18px 28px}
    .dash-title{margin:0 0 12px;font-size:1.08rem;color:#172033}
    .main-action{width:100%;border:0;border-radius:22px;padding:22px 18px;margin-bottom:14px;color:#fff;display:flex;align-items:center;gap:16px;text-align:left;box-shadow:0 10px 24px rgba(25,75,150,.18)}
    .main-action.blue{background:linear-gradient(135deg,#2484ff,#0048c8)}
    .main-action.green{background:linear-gradient(135deg,#2bc66f,#07914f)}
    .main-action .big-icon{width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,.96);display:grid;place-items:center;font-size:1.85rem;color:#075ec7;flex:0 0 auto}
    .main-action.green .big-icon{color:#0c9d58}
    .main-action strong{display:block;font-size:1.12rem;line-height:1.15}
    .main-action small{display:block;margin-top:5px;color:rgba(255,255,255,.9);font-size:.82rem}
    .quick-grid,.admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .quick-card,.admin-card{position:relative;border:1px solid #e7ebf2;border-radius:18px;padding:16px 14px;background:#fff;min-height:118px;display:flex;align-items:center;gap:12px;text-align:left;box-shadow:0 5px 16px rgba(27,67,122,.07);color:#172033}
    .quick-card .icon,.admin-card .icon{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-size:1.45rem;flex:0 0 auto}
    .tone-orange{background:#fff8f1}.tone-orange .icon{background:#ff7a13;color:#fff}
    .tone-red{background:#fff4f5}.tone-red .icon{background:#e73345;color:#fff}
    .tone-purple{background:#f8f4ff}.tone-purple .icon{background:#7448c8;color:#fff}
    .tone-green{background:#f1fbf5}.tone-green .icon{background:#15a960;color:#fff}
    .tone-blue{background:#f3f8ff}.tone-blue .icon{background:#1674df;color:#fff}
    .tone-gray{background:#f6f7f9}.tone-gray .icon{background:#6b7280;color:#fff}
    .quick-card strong,.admin-card strong{display:block;font-size:.92rem;line-height:1.15}
    .quick-card small,.admin-card small{display:block;margin-top:5px;font-size:.72rem;color:#657086;line-height:1.2}
    .count-badge{position:absolute;right:9px;top:8px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:#ef3340;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.74rem;font-weight:800}
    .summary-wrap{margin-top:22px}.summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
    .summary-item{border-radius:16px;padding:12px 5px;text-align:center;border:1px solid #e5eaf2;background:#fff}
    .summary-item span{display:block;font-size:.68rem;color:#667085}.summary-item strong{display:block;font-size:1.4rem;margin:3px 0;color:#172033}
    .bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:1000;background:#fff;border-top:1px solid #e8ebf1;display:grid;grid-template-columns:repeat(5,1fr);padding:8px 8px calc(8px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(24,42,75,.08)}
    .bottom-nav button{border:0;background:transparent;color:#596275;padding:5px 2px;font-size:.67rem;display:flex;flex-direction:column;align-items:center;gap:3px}.bottom-nav button span{font-size:1.25rem}.bottom-nav button.active{color:#075ec7;font-weight:800}
    .permission-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%) translateY(20px);width:min(90%,420px);background:#172033;color:#fff;padding:14px 16px;border-radius:14px;opacity:0;pointer-events:none;transition:.2s;z-index:1200;text-align:center}.permission-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
    #adminPanelScreen{background:#f6f8fb;min-height:100vh;padding-bottom:96px}
    .admin-header{background:linear-gradient(135deg,#0b67b4,#06469e);color:#fff;border-radius:0 0 34px 34px;padding:calc(24px + env(safe-area-inset-top)) 22px 28px}
    .admin-header-row{display:flex;justify-content:space-between;align-items:center;gap:12px}.admin-back,.admin-logout{border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.12);color:#fff;border-radius:12px;padding:10px 13px}
    .admin-header h2{margin:24px 0 4px;font-size:1.7rem}.admin-header p{margin:0;color:#d8e9ff}
    .admin-body{padding:18px}.admin-note{background:#eef6ff;border:1px solid #cfe3ff;border-radius:16px;padding:14px;color:#174a84;margin-bottom:20px}
    .admin-section{margin:22px 0}.admin-section h3{margin:0 0 12px;color:#172033;font-size:1.05rem}
    .admin-card{min-height:124px;align-items:flex-start;flex-direction:column}.admin-card .icon{width:46px;height:46px}.admin-card.full{grid-column:1/-1;min-height:auto;flex-direction:row;align-items:center}
    .secure-note{margin-top:22px;background:#fff9e9;border:1px solid #f4dda2;border-radius:16px;padding:14px;color:#6f5710;font-size:.82rem}
    @media(max-width:390px){.summary-grid{grid-template-columns:repeat(2,1fr)}.quick-card,.admin-card{padding:13px 11px}.main-action strong{font-size:1rem}}
  `;
  document.head.appendChild(style);

  const home = document.getElementById('homeScreen');
  const dashboard = document.getElementById('dashboard');
  let toastTimer;

  function getSession(){try{return JSON.parse(sessionStorage.getItem('heuroSession')||'null')}catch{return null}}
  function getRequests(){try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return []}}
  function getUsers(){try{return JSON.parse(localStorage.getItem('heuroUsers')||'[]')}catch{return []}}
  function showToast(message){
    let toast=document.getElementById('permissionToast');
    if(!toast){toast=document.createElement('div');toast.id='permissionToast';toast.className='permission-toast';document.body.appendChild(toast)}
    toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600);
  }
  function showExistingView(name){if(typeof window.showView==='function')window.showView(`${name}View`)}
  function summary(){
    const s=getSession(),all=getRequests(),today=new Date().toISOString().slice(0,10);
    const data=s?.profile==='solicitante'?all.filter(r=>r.requesterId===s.id||r.requester===s.name):all;
    return {
      confirmed:data.filter(r=>r.transportDate===today).length,
      analysis:data.filter(r=>String(r.status).toLowerCase().includes('anál')||String(r.status).toLowerCase().includes('solicit')).length,
      pending:data.filter(r=>!String(r.status).toLowerCase().includes('conclu')).length,
      completed:data.filter(r=>String(r.status).toLowerCase().includes('conclu')).length
    };
  }

  function ensureBottomNav(){
    if(document.getElementById('bottomNav'))return;
    const nav=document.createElement('nav');nav.id='bottomNav';nav.className='bottom-nav';
    nav.innerHTML=`
      <button data-nav="home" class="active"><span>⌂</span>Início</button>
      <button data-nav="transports"><span>🚑</span>Transportes</button>
      <button data-nav="notifications"><span>🔔</span>Notificações</button>
      <button data-nav="profile"><span>♙</span>Perfil</button>
      <button data-nav="more"><span>•••</span>Mais</button>`;
    document.body.appendChild(nav);
    nav.addEventListener('click',e=>{
      const button=e.target.closest('button');if(!button)return;
      const action=button.dataset.nav;
      if(action==='home'){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));home.classList.add('active');document.getElementById('adminPanelScreen')?.classList.remove('active');document.getElementById('dashboard').classList.remove('hidden');}
      if(action==='transports')showExistingView('list');
      if(action==='notifications')showToast('Central de notificações em estruturação.');
      if(action==='profile')showToast('Área de perfil em estruturação.');
      if(action==='more')openAdminPanel();
    });
  }

  function renderHome(){
    const s=getSession();if(!s||!home?.classList.contains('active')||!dashboard)return;
    const sum=summary();const pendingUsers=getUsers().filter(u=>u.status==='aguardando').length;
    dashboard.className='official-dashboard';
    dashboard.innerHTML=`
      <h3 class="dash-title">Ações principais</h3>
      <button class="main-action blue" data-home-action="request"><span class="big-icon">▤</span><span><strong>SOLICITAÇÃO DE TRANSPORTE</strong><small>Registrar nova solicitação de transporte</small></span></button>
      <button class="main-action green" data-home-action="transport"><span class="big-icon">🚑</span><span><strong>TRANSPORTES DA EQUIPE</strong><small>Visualizar e acompanhar transportes da equipe</small></span></button>
      <h3 class="dash-title" style="margin-top:24px">Ações rápidas</h3>
      <div class="quick-grid">
        <button class="quick-card tone-orange" data-home-action="pending"><span class="icon">◷</span><span><strong>Solicitações pendentes</strong><small>Pedidos aguardando andamento</small></span><b class="count-badge">${sum.pending}</b></button>
        <button class="quick-card tone-red" data-home-action="approve"><span class="icon">👥</span><span><strong>Aprovar cadastros</strong><small>Autorizar novos acessos</small></span>${pendingUsers?`<b class="count-badge">${pendingUsers}</b>`:''}</button>
        <button class="quick-card tone-purple" data-home-action="agenda"><span class="icon">▦</span><span><strong>Agenda de transportes</strong><small>Calendário e programações</small></span></button>
        <button class="quick-card tone-green" data-home-action="history"><span class="icon">↶</span><span><strong>Histórico de transportes</strong><small>Consultar transportes realizados</small></span></button>
      </div>
      <section class="summary-wrap"><h3 class="dash-title">Resumo do dia</h3><div class="summary-grid">
        <div class="summary-item tone-green"><strong>${sum.confirmed}</strong><span>Confirmados</span></div>
        <div class="summary-item tone-orange"><strong>${sum.analysis}</strong><span>Em análise</span></div>
        <div class="summary-item" style="background:#fff9e9"><strong>${sum.pending}</strong><span>Pendentes</span></div>
        <div class="summary-item tone-blue"><strong>${sum.completed}</strong><span>Concluídos</span></div>
      </div></section>`;
    dashboard.querySelectorAll('[data-home-action]').forEach(btn=>btn.addEventListener('click',()=>{
      const action=btn.dataset.homeAction;
      if(action==='request'){
        if(s.profile==='transporte')return showToast('Seu perfil não possui permissão para registrar solicitações.');
        return showExistingView('request');
      }
      if(action==='transport'||action==='pending'||action==='history')return showExistingView('list');
      if(action==='approve'){
        if(s.profile!=='administrador')return showToast('Este acesso é exclusivo para administradores.');
        return showExistingView('users');
      }
      if(action==='agenda')showToast('Agenda de transportes em estruturação.');
    }));
    ensureBottomNav();
  }

  function ensureAdminPanel(){
    if(document.getElementById('adminPanelScreen'))return;
    const panel=document.createElement('section');panel.id='adminPanelScreen';panel.className='screen';
    panel.innerHTML=`
      <header class="admin-header"><div class="admin-header-row"><button class="admin-back" id="adminBack">← Voltar</button><button class="admin-logout" id="adminLogout">Sair</button></div><h2>Administrador</h2><p>Painel de gestão do sistema</p></header>
      <div class="admin-body"><div class="admin-note"><strong>Área exclusiva para administradores.</strong><br>Gerencie usuários, frota, equipes e configurações.</div>
        <section class="admin-section"><h3>Gestão de usuários</h3><div class="admin-grid">
          <button class="admin-card tone-red" data-admin="approve"><span class="icon">👥</span><span><strong>Aprovar cadastros</strong><small>Autorizar novos acessos</small></span></button>
          <button class="admin-card tone-blue" data-admin="users"><span class="icon">♟</span><span><strong>Usuários cadastrados</strong><small>Gerenciar usuários e informações</small></span></button>
          <button class="admin-card tone-purple" data-admin="permissions"><span class="icon">🛡</span><span><strong>Perfis e permissões</strong><small>Definir níveis de acesso</small></span></button>
          <button class="admin-card tone-orange" data-admin="blocked"><span class="icon">🔒</span><span><strong>Usuários bloqueados</strong><small>Gerenciar bloqueios</small></span></button>
        </div></section>
        <section class="admin-section"><h3>Gestão operacional</h3><div class="admin-grid">
          <button class="admin-card tone-green" data-admin="fleet"><span class="icon">🚑</span><span><strong>Frota e ambulâncias</strong><small>Veículos e manutenções</small></span></button>
          <button class="admin-card tone-blue" data-admin="teams"><span class="icon">👥</span><span><strong>Equipes e profissionais</strong><small>Equipes e vínculos</small></span></button>
          <button class="admin-card tone-purple full" data-admin="agenda"><span class="icon">▦</span><span><strong>Agenda de transportes</strong><small>Calendário e programações</small></span></button>
        </div></section>
        <section class="admin-section"><h3>Administração do sistema</h3><div class="admin-grid">
          <button class="admin-card tone-orange" data-admin="reports"><span class="icon">▥</span><span><strong>Relatórios</strong><small>Indicadores e desempenho</small></span></button>
          <button class="admin-card tone-blue" data-admin="audit"><span class="icon">🛡</span><span><strong>Auditoria e histórico</strong><small>Logs e ações registradas</small></span></button>
          <button class="admin-card tone-gray" data-admin="settings"><span class="icon">⚙</span><span><strong>Configurações</strong><small>Ajustes gerais do sistema</small></span></button>
          <button class="admin-card tone-green" data-admin="backup"><span class="icon">☁</span><span><strong>Backup e armazenamento</strong><small>Segurança e dados</small></span></button>
        </div></section>
        <div class="secure-note"><strong>Ambiente seguro</strong><br>Todas as ações realizadas neste painel deverão ser registradas e auditadas.</div>
      </div>`;
    document.getElementById('app').appendChild(panel);
    panel.querySelector('#adminBack').addEventListener('click',()=>{panel.classList.remove('active');home.classList.add('active');renderHome();});
    panel.querySelector('#adminLogout').addEventListener('click',()=>document.getElementById('logoutButton')?.click());
    panel.querySelectorAll('[data-admin]').forEach(btn=>btn.addEventListener('click',()=>{
      const action=btn.dataset.admin;
      if(action==='approve'||action==='users')return showExistingView('users');
      if(action==='settings')return showExistingView('settings');
      showToast('Módulo reservado no painel administrativo e em fase de estruturação.');
    }));
  }

  function openAdminPanel(){
    const s=getSession();
    if(!s)return;
    if(s.profile!=='administrador')return showToast('Acesso bloqueado. Esta área é exclusiva para administradores.');
    ensureAdminPanel();
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
    document.getElementById('adminPanelScreen').classList.add('active');window.scrollTo(0,0);
  }

  const observer=new MutationObserver(()=>renderHome());
  if(home)observer.observe(home,{attributes:true,attributeFilter:['class']});
  setTimeout(()=>{ensureAdminPanel();renderHome()},250);
  window.addEventListener('storage',renderHome);
})();