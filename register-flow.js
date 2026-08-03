(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const home = $('homeScreen');
  const dashboard = $('dashboard');
  let toastTimer = null;

  /* Primeiro cadastro — fluxo em duas etapas */
  const registerScreen = $('registerScreen');
  const detailsScreen = $('registerDetailsScreen');
  const loginScreen = $('loginScreen');
  const continueButton = $('continueRegister');
  const backButton = $('registerDetailsBack');
  const form = $('registerForm');
  const choiceMessage = $('profileChoiceMessage');
  const selectedLabel = $('selectedProfileLabel');
  const selectedText = $('selectedProfileText');
  const profileLabels = {
    solicitante: 'Solicitante de transporte',
    transporte: 'Executante de transporte',
    administrador: 'Administrador'
  };

  function activateOnly(screen) {
    if (!screen) return;
    document.querySelectorAll('.screen').forEach((item) => item.classList.remove('active'));
    screen.classList.add('active');
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('input[name="profileChoice"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (!choiceMessage) return;
      choiceMessage.textContent = '';
      choiceMessage.className = 'form-message';
    });
  });

  continueButton?.addEventListener('click', () => {
    const choice = document.querySelector('input[name="profileChoice"]:checked');
    if (!choice) {
      if (choiceMessage) {
        choiceMessage.textContent = 'Selecione uma das três opções para continuar.';
        choiceMessage.className = 'form-message error';
      }
      return;
    }
    const profileInput = document.querySelector(`input[name="registerProfile"][value="${choice.value}"]`);
    if (profileInput) profileInput.checked = true;
    if (selectedLabel) selectedLabel.textContent = profileLabels[choice.value];
    if (selectedText) selectedText.textContent = `Cadastro para ${profileLabels[choice.value]}. Preencha seus dados.`;
    activateOnly(detailsScreen);
  });

  backButton?.addEventListener('click', () => activateOnly(registerScreen));
  form?.addEventListener('submit', () => {
    setTimeout(() => {
      if (detailsScreen?.classList.contains('active')) activateOnly(loginScreen);
    }, 1100);
  });

  /* Tela de comando — controlador único */
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); }
    catch (_) { return null; }
  }

  function getRequests() {
    try { return JSON.parse(localStorage.getItem('heuroRequests') || '[]'); }
    catch (_) { return []; }
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem('heuroUsers') || '[]'); }
    catch (_) { return []; }
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[char]);
  }

  function formatDate(value) {
    if (!value) return 'Não informado';
    const [year, month, day] = String(value).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  function showToast(message) {
    let toast = $('permissionToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'permissionToast';
      toast.className = 'permission-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function summaryData() {
    const session = getSession();
    const all = getRequests();
    const today = new Date().toISOString().slice(0, 10);
    const data = session?.profile === 'solicitante'
      ? all.filter((item) => item.requesterId === session.id || item.requester === session.name)
      : all;
    const status = (item) => String(item.status || '').toLowerCase();
    return {
      all: data,
      confirmed: data.filter((item) => item.transportDate === today && !status(item).includes('conclu')).length,
      analysis: data.filter((item) => status(item).includes('solicit') || status(item).includes('anál')).length,
      pending: data.filter((item) => !status(item).includes('conclu')).length,
      completed: data.filter((item) => status(item).includes('conclu')).length
    };
  }

  function ensureStyles() {
    if ($('command-clean-style')) return;
    const style = document.createElement('style');
    style.id = 'command-clean-style';
    style.textContent = `
      #homeScreen{padding-bottom:92px}
      #dashboard.official-dashboard{display:block;padding:18px 18px 28px}
      .dash-title{margin:0 0 12px;font-size:1.08rem;color:#172033}
      .main-action{width:100%;border:0;border-radius:22px;padding:22px 18px;margin-bottom:14px;color:#fff;display:flex;align-items:center;gap:16px;text-align:left;box-shadow:0 10px 24px rgba(25,75,150,.18);touch-action:manipulation}
      .main-action.blue{background:linear-gradient(135deg,#2484ff,#0048c8)}
      .main-action.green{background:linear-gradient(135deg,#2bc66f,#07914f)}
      .main-action .big-icon{width:58px;height:58px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:1.7rem;color:#075ec7;flex:0 0 auto}
      .main-action.green .big-icon{color:#0c9d58}
      .main-action strong{display:block;font-size:1.05rem}.main-action small{display:block;margin-top:5px;color:#eef6ff;font-size:.8rem}
      .quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .quick-card{position:relative;border:1px solid #e7ebf2;border-radius:18px;padding:16px 12px;background:#fff;min-height:118px;display:flex;align-items:center;gap:10px;text-align:left;box-shadow:0 5px 16px rgba(27,67,122,.07);color:#172033;touch-action:manipulation}
      .quick-card .icon{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-size:1.35rem;flex:0 0 auto}
      .tone-orange{background:#fff8f1}.tone-orange .icon{background:#ff7a13;color:#fff}.tone-red{background:#fff4f5}.tone-red .icon{background:#e73345;color:#fff}
      .tone-purple{background:#f8f4ff}.tone-purple .icon{background:#7448c8;color:#fff}.tone-green{background:#f1fbf5}.tone-green .icon{background:#15a960;color:#fff}
      .tone-blue{background:#f3f8ff}.tone-blue .icon{background:#1674df;color:#fff}.quick-card strong{display:block;font-size:.9rem}.quick-card small{display:block;margin-top:4px;font-size:.7rem;color:#657086}
      .count-badge{position:absolute;right:8px;top:7px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:#ef3340;color:#fff;display:grid;place-items:center;font-size:.72rem;font-weight:800}
      .summary-wrap{margin-top:22px}.summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
      .summary-item{appearance:none;-webkit-appearance:none;width:100%;border-radius:16px;padding:12px 4px;text-align:center;border:1px solid #e5eaf2;background:#fff;touch-action:manipulation;color:#172033}
      .summary-item span{display:block;font-size:.66rem;color:#667085}.summary-item strong{display:block;font-size:1.35rem;margin:3px 0}
      .bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:1000;background:#fff;border-top:1px solid #e8ebf1;display:grid;grid-template-columns:repeat(5,1fr);padding:8px 8px calc(8px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(24,42,75,.08)}
      .bottom-nav button{border:0;background:transparent;color:#596275;padding:5px 2px;font-size:.67rem;display:flex;flex-direction:column;align-items:center;gap:3px;touch-action:manipulation}.bottom-nav button span{font-size:1.2rem}.bottom-nav button.active{color:#075ec7;font-weight:800}
      .permission-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%) translateY(20px);width:min(90%,420px);background:#172033;color:#fff;padding:14px 16px;border-radius:14px;opacity:0;pointer-events:none;transition:.2s;z-index:1500;text-align:center}.permission-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
      #requestedView{margin:18px}.requested-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.requested-toolbar input,.requested-toolbar select{min-height:46px;border:1px solid #dce3ed;border-radius:12px;padding:0 12px;background:#fff;flex:1;min-width:140px}
      .requested-card{border:1px solid #e3e9f1;border-left:6px solid #e73345;border-radius:16px;padding:14px;margin:10px 0;background:#fff}.requested-card.accepted{border-left-color:#f18a21}.requested-card.completed{border-left-color:#18a45b}
      .requested-card h4{margin:0 0 6px}.requested-card p{margin:4px 0;font-size:.82rem;color:#526078}.requested-card b{color:#172033}
      @media(max-width:390px){.summary-grid{grid-template-columns:repeat(2,1fr)}.quick-card{padding:13px 10px}.main-action strong{font-size:.96rem}}
    `;
    document.head.appendChild(style);
  }

  function ensureRequestedView() {
    let view = $('requestedView');
    if (view) return view;
    view = document.createElement('section');
    view.id = 'requestedView';
    view.className = 'content-view hidden';
    view.innerHTML = `
      <div class="section-head">
        <div><span class="eyebrow dark">Consulta</span><h3>Transportes solicitados</h3><p>Visualização somente para consulta. O status não pode ser alterado nesta tela.</p></div>
        <button class="back-button" type="button" data-command-back>Voltar</button>
      </div>
      <div class="requested-toolbar">
        <input id="requestedSearch" type="search" placeholder="Pesquisar paciente ou protocolo" />
        <select id="requestedStatus"><option value="all">Todos os status</option><option value="pending">Solicitados/Pendentes</option><option value="accepted">Aceitos</option><option value="completed">Concluídos</option></select>
      </div>
      <div id="requestedList"></div>`;
    home?.appendChild(view);
    view.querySelector('[data-command-back]')?.addEventListener('click', showDashboard);
    view.querySelector('#requestedSearch')?.addEventListener('input', renderRequested);
    view.querySelector('#requestedStatus')?.addEventListener('change', renderRequested);
    return view;
  }

  function classifyStatus(item) {
    const value = String(item.status || '').toLowerCase();
    if (value.includes('conclu') || value.includes('finaliz')) return 'completed';
    if (value.includes('aceit') || value.includes('andamento')) return 'accepted';
    return 'pending';
  }

  function renderRequested() {
    const view = ensureRequestedView();
    const box = view.querySelector('#requestedList');
    const term = String(view.querySelector('#requestedSearch')?.value || '').trim().toLowerCase();
    const filter = view.querySelector('#requestedStatus')?.value || 'all';
    const data = summaryData().all.filter((item) => {
      const category = classifyStatus(item);
      const text = `${item.patient || ''} ${item.protocol || ''} ${item.requester || ''} ${item.destination || ''}`.toLowerCase();
      return (filter === 'all' || filter === category) && (!term || text.includes(term));
    });
    if (!data.length) {
      box.innerHTML = '<div class="card empty">Nenhuma solicitação encontrada.</div>';
      return;
    }
    box.innerHTML = data.map((item) => {
      const category = classifyStatus(item);
      return `<article class="requested-card ${category}">
        <h4>${escapeHtml(item.patient || 'Paciente não informado')}</h4>
        <p><b>Protocolo:</b> ${escapeHtml(item.protocol || 'Não informado')}</p>
        <p><b>Origem:</b> ${escapeHtml(item.originSector || item.origin || 'Não informada')} → <b>Destino:</b> ${escapeHtml(item.destination || 'Não informado')}</p>
        <p><b>Data:</b> ${formatDate(item.transportDate)} às ${escapeHtml(item.transportTime || 'Não informado')}</p>
        <p><b>Status:</b> ${escapeHtml(item.status || 'Solicitado')} · <b>Solicitado por:</b> ${escapeHtml(item.requester || 'Não informado')}</p>
      </article>`;
    }).join('');
  }

  function hideAllViews() {
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => view.classList.add('hidden'));
  }

  function openExistingView(viewId) {
    if (!$(viewId)) return;
    dashboard?.classList.add('hidden');
    hideAllViews();
    $(viewId).classList.remove('hidden');
    if (viewId === 'listView' && typeof window.renderList === 'function') window.renderList();
    if (viewId === 'usersView' && typeof window.renderUsers === 'function') window.renderUsers();
    window.scrollTo(0, 0);
  }

  function openRequested(status = 'all') {
    dashboard?.classList.add('hidden');
    hideAllViews();
    const view = ensureRequestedView();
    view.classList.remove('hidden');
    const select = view.querySelector('#requestedStatus');
    if (select) select.value = status;
    renderRequested();
    window.scrollTo(0, 0);
  }

  function showDashboard() {
    hideAllViews();
    dashboard?.classList.remove('hidden');
    refreshDashboardNumbers();
    window.scrollTo(0, 0);
  }

  function ensureBottomNav() {
    let nav = $('bottomNav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = 'bottomNav';
      nav.className = 'bottom-nav';
      nav.innerHTML = `
        <button type="button" data-nav="home" class="active"><span>⌂</span>Início</button>
        <button type="button" data-nav="solicitados"><span>▤</span>Solicitados</button>
        <button type="button" data-nav="notifications"><span>🔔</span>Notificações</button>
        <button type="button" data-nav="profile"><span>♙</span>Perfil</button>
        <button type="button" data-nav="more"><span>•••</span>Mais</button>`;
      document.body.appendChild(nav);
    }
    if (nav.dataset.bound !== '1') {
      nav.dataset.bound = '1';
      nav.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-nav]');
        if (!button) return;
        const action = button.dataset.nav;
        if (action === 'home') showDashboard();
        if (action === 'solicitados') openRequested('all');
        if (action === 'notifications') showToast('Central de notificações em estruturação.');
        if (action === 'profile') {
          const active = getSession();
          showToast(active ? `${active.name} — ${profileLabels[active.profile] || active.profile}` : 'Perfil do usuário');
        }
        if (action === 'more') {
          const active = getSession();
          if (active?.profile === 'administrador') openExistingView('usersView');
          else showToast('Esta área é exclusiva para administradores.');
        }
      });
    }
  }

  function buildDashboard() {
    const session = getSession();
    if (!session || !home?.classList.contains('active') || !dashboard) return;
    ensureStyles();
    ensureRequestedView();
    ensureBottomNav();
    const summary = summaryData();
    const pendingUsers = getUsers().filter((user) => user.status === 'aguardando').length;
    dashboard.className = 'official-dashboard';
    dashboard.dataset.commandBuilt = '1';
    dashboard.innerHTML = `
      <h3 class="dash-title">Ações principais</h3>
      <button type="button" class="main-action blue" data-command="request"><span class="big-icon">▤</span><span><strong>SOLICITAÇÃO DE TRANSPORTE</strong><small>Registrar nova solicitação de transporte</small></span></button>
      <button type="button" class="main-action green" data-command="team"><span class="big-icon">🚑</span><span><strong>TRANSPORTES DA EQUIPE</strong><small>Visualizar e acompanhar transportes da equipe</small></span></button>
      <h3 class="dash-title" style="margin-top:24px">Ações rápidas</h3>
      <div class="quick-grid">
        <button type="button" class="quick-card tone-orange" data-command="pending"><span class="icon">◷</span><span><strong>Solicitações pendentes</strong><small>Pedidos aguardando andamento</small></span><b class="count-badge" data-count="pending">${summary.pending}</b></button>
        <button type="button" class="quick-card tone-red" data-command="approve"><span class="icon">👥</span><span><strong>Aprovar cadastros</strong><small>Autorizar novos acessos</small></span>${pendingUsers ? `<b class="count-badge">${pendingUsers}</b>` : ''}</button>
        <button type="button" class="quick-card tone-purple" data-command="agenda"><span class="icon">▦</span><span><strong>Agenda de transportes</strong><small>Calendário e programações</small></span></button>
        <button type="button" class="quick-card tone-green" data-command="history"><span class="icon">↶</span><span><strong>Histórico de transportes</strong><small>Consultar transportes realizados</small></span></button>
      </div>
      <section class="summary-wrap"><h3 class="dash-title">Resumo do dia</h3><div class="summary-grid">
        <button type="button" class="summary-item tone-green" data-summary="confirmed"><strong data-count="confirmed">${summary.confirmed}</strong><span>Confirmados</span></button>
        <button type="button" class="summary-item tone-orange" data-summary="analysis"><strong data-count="analysis">${summary.analysis}</strong><span>Em análise</span></button>
        <button type="button" class="summary-item" style="background:#fff9e9" data-summary="pending"><strong data-count="pending">${summary.pending}</strong><span>Pendentes</span></button>
        <button type="button" class="summary-item tone-blue" data-summary="completed"><strong data-count="completed">${summary.completed}</strong><span>Concluídos</span></button>
      </div></section>`;
  }

  function refreshDashboardNumbers() {
    if (dashboard?.dataset.commandBuilt !== '1') return;
    const summary = summaryData();
    dashboard.querySelectorAll('[data-count="confirmed"]').forEach((el) => { el.textContent = summary.confirmed; });
    dashboard.querySelectorAll('[data-count="analysis"]').forEach((el) => { el.textContent = summary.analysis; });
    dashboard.querySelectorAll('[data-count="pending"]').forEach((el) => { el.textContent = summary.pending; });
    dashboard.querySelectorAll('[data-count="completed"]').forEach((el) => { el.textContent = summary.completed; });
  }

  dashboard?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-command],button[data-summary]');
    if (!button) return;
    const session = getSession();
    const command = button.dataset.command;
    const summary = button.dataset.summary;

    if (summary === 'confirmed') openRequested('all');
    if (summary === 'analysis') openRequested('pending');
    if (summary === 'pending') openRequested('pending');
    if (summary === 'completed') openRequested('completed');

    if (command === 'request') {
      if (session?.profile === 'transporte') showToast('Seu perfil não possui permissão para registrar solicitações.');
      else openExistingView('requestView');
    }
    if (command === 'team') openExistingView('listView');
    if (command === 'pending') openRequested('pending');
    if (command === 'approve') {
      if (session?.profile === 'administrador') openExistingView('usersView');
      else showToast('Este acesso é exclusivo para administradores.');
    }
    if (command === 'agenda') showToast('Agenda de transportes em estruturação.');
    if (command === 'history') openRequested('completed');
  });

  /* Constrói uma vez quando a tela principal se torna ativa; não recria ao abrir uma lista. */
  const homeObserver = new MutationObserver(() => {
    if (!home?.classList.contains('active')) return;
    if (dashboard?.dataset.commandBuilt !== '1') buildDashboard();
    else refreshDashboardNumbers();
  });
  if (home) homeObserver.observe(home, { attributes: true, attributeFilter: ['class'] });

  document.querySelector('#loginForm')?.addEventListener('submit', () => setTimeout(buildDashboard, 80));
  window.addEventListener('storage', () => {
    refreshDashboardNumbers();
    if (!$('requestedView')?.classList.contains('hidden')) renderRequested();
  });

  setTimeout(() => {
    if (home?.classList.contains('active')) buildDashboard();
  }, 250);
})();
