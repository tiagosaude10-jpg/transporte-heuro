(() => {
  'use strict';

  const CONFIG = window.HEURO_SUPABASE_CONFIG;
  const hasSupabase = Boolean(window.supabase && CONFIG?.url && CONFIG?.publishableKey);
  const db = hasSupabase ? window.supabase.createClient(CONFIG.url, CONFIG.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;
  const $ = (id) => document.getElementById(id);
  const TZ = 'America/Porto_Velho';
  const state = {
    user: null, profile: null, requests: [], executions: [], profiles: [], settings: null,
    currentView: 'home', realtime: null, refreshTimer: null, busy: false
  };
  const roles = {
    solicitante: 'Solicitante de transporte', executante: 'Executante de transporte',
    solicitante_executante: 'Solicitante e executante', administrador_geral: 'Administrador geral'
  };

  function esc(value = '') {
    return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);
  }
  function digits(value = '') { return String(value).replace(/\D/g, ''); }
  function normalize(value = '') { return String(value).trim().toLowerCase(); }
  function formatDate(value) {
    if (!value) return '—';
    const raw = String(value).slice(0, 10).split('-');
    return raw.length === 3 ? `${raw[2]}/${raw[1]}/${raw[0]}` : String(value);
  }
  function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }
  function formatTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 5);
    return new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(date);
  }
  function todayISO() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${map.year}-${map.month}-${map.day}`;
  }
  function locationText(item) { return item.origin_location || 'Não informado'; }
  function supportLabel(value) { return value === 'avancado_uti' ? 'UTI móvel' : 'Suporte básico'; }
  function priorityLabel(value) { return value === 'emergencia' ? 'Emergência' : value === 'urgencia' ? 'Urgente' : 'Programado'; }
  function canRequest() { return ['solicitante', 'solicitante_executante', 'administrador_geral'].includes(state.profile?.authorized_access); }
  function canExecute() { return ['executante', 'solicitante_executante', 'administrador_geral'].includes(state.profile?.authorized_access); }
  function isAdmin() { return state.profile?.authorized_access === 'administrador_geral'; }
  function isApproved() { return state.profile?.status === 'aprovado' && Boolean(state.profile?.authorized_access); }
  function executionFor(id) { return state.executions.find((row) => row.request_id === id) || null; }
  function category(item) {
    if (item.status === 'executado') return 'done';
    if (item.status === 'cancelado') return 'cancelled';
    if (item.status === 'em_execucao') return 'accepted';
    return 'pending';
  }
  function statusLabel(item) {
    return ({ pending: 'Pendente', accepted: 'Aceito / em andamento', done: 'Concluído', cancelled: 'Cancelado' })[category(item)];
  }
  function cpfMask(value) {
    return digits(value).slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  function validCpf(value) {
    const cpf = digits(value);
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
    let check = (sum * 10) % 11; if (check === 10) check = 0;
    if (check !== Number(cpf[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
    check = (sum * 10) % 11; if (check === 10) check = 0;
    return check === Number(cpf[10]);
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === id));
    window.scrollTo(0, 0);
  }
  function message(id, text, type = 'error') {
    const el = $(id); if (!el) return;
    el.textContent = text || '';
    el.className = `form-message${type === 'success' ? ' success' : ''}`;
  }
  let toastTimer;
  function toast(text, type = '') {
    const el = $('toast'); el.textContent = text; el.className = `toast show${type ? ` ${type}` : ''}`;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
  }
  function setLoading(active, text = 'Carregando...') {
    state.busy = active; $('loadingText').textContent = text; $('loadingOverlay').classList.toggle('hidden', !active);
  }
  function updateConnection() {
    const online = navigator.onLine;
    $('connectionState').className = `connection-state ${online ? 'online' : 'offline'}`;
    $('connectionState').title = online ? 'Conectado à central' : 'Sem conexão';
  }
  function friendlyError(error, fallback = 'Não foi possível concluir a operação.') {
    const raw = error?.message || String(error || '');
    if (/invalid login credentials/i.test(raw)) return 'CPF/e-mail ou senha incorretos.';
    if (/user already registered/i.test(raw)) return 'Este e-mail já possui cadastro.';
    if (/duplicate key.*cpf|profiles_cpf/i.test(raw)) return 'Este CPF já possui cadastro.';
    if (/duplicate key.*username/i.test(raw)) return 'Este nome de usuário já está em uso.';
    if (/network|fetch/i.test(raw)) return 'Sem conexão com a central. Verifique a internet e tente novamente.';
    return raw || fallback;
  }

  async function loadProfile(userId) {
    const { data, error } = await db.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  }
  async function ensureApproved(user) {
    const profile = await loadProfile(user.id);
    state.user = user; state.profile = profile;
    if (profile.status !== 'aprovado' || !profile.authorized_access) {
      await db.auth.signOut(); state.user = null; state.profile = null;
      if (profile.status === 'bloqueado') throw new Error('Seu acesso está bloqueado. Procure o administrador.');
      throw new Error('Seu cadastro ainda está aguardando autorização do administrador.');
    }
    return profile;
  }

  async function refreshData({ quiet = false } = {}) {
    if (!state.user || !isApproved()) return;
    if (!quiet) setLoading(true, 'Atualizando dados...');
    try {
      const tasks = [
        db.from('transport_requests').select('*').order('created_at', { ascending: false }),
        db.from('transport_executions').select('*').order('accepted_at', { ascending: false }),
        db.from('transport_app_settings').select('*').eq('id', 1).maybeSingle()
      ];
      if (isAdmin()) tasks.push(db.from('profiles').select('*').order('created_at', { ascending: false }));
      const results = await Promise.all(tasks);
      if (results[0].error) throw results[0].error;
      state.requests = results[0].data || [];
      state.executions = results[1].error ? [] : (results[1].data || []);
      state.settings = results[2].error ? null : results[2].data;
      state.profiles = isAdmin() && !results[3].error ? (results[3].data || []) : [];
      $('syncTime').textContent = `Atualizado ${formatTime(new Date().toISOString())}`;
      renderDashboard();
      if (state.currentView !== 'home') renderCurrentView();
    } catch (error) {
      console.error(error); toast(friendlyError(error, 'Falha ao atualizar os dados.'), 'error');
    } finally { if (!quiet) setLoading(false); }
  }

  function setupRealtime() {
    if (state.realtime) db.removeChannel(state.realtime);
    let timer;
    const schedule = () => { clearTimeout(timer); timer = setTimeout(() => refreshData({ quiet: true }), 450); };
    state.realtime = db.channel(`heuro-${state.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_requests' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_executions' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, schedule)
      .subscribe();
    clearInterval(state.refreshTimer);
    state.refreshTimer = setInterval(() => { if (!document.hidden) refreshData({ quiet: true }); }, 30000);
  }

  async function enterApplication() {
    $('homeTitle').textContent = `Olá, ${state.profile.display_name || state.profile.full_name || state.profile.username}`;
    $('homeRole').textContent = roles[state.profile.authorized_access] || state.profile.authorized_access;
    showScreen('homeScreen'); openHome();
    await refreshData(); setupRealtime();
  }

  function renderDashboard() {
    if (!state.profile) return;
    const pending = state.requests.filter((row) => category(row) === 'pending').length;
    const accepted = state.requests.filter((row) => category(row) === 'accepted').length;
    const done = state.requests.filter((row) => category(row) === 'done').length;
    const today = state.requests.filter((row) => row.transport_date === todayISO()).length;
    $('summaryCards').innerHTML = `
      <button class="summary-card pending" data-command="pending"><b>${pending}</b><small>Pendentes</small></button>
      <button class="summary-card accepted" data-command="accepted"><b>${accepted}</b><small>Aceitos</small></button>
      <button class="summary-card done" data-command="history"><b>${done}</b><small>Finalizados</small></button>
      <button class="summary-card today" data-command="agenda"><b>${today}</b><small>Agenda hoje</small></button>`;

    const commands = [];
    if (canRequest()) commands.push(`<button class="command-card featured" data-command="new"><span class="command-icon">＋</span><strong>NOVA SOLICITAÇÃO DE TRANSPORTE</strong><small>Registrar pedido e anexar documento ou fotografia</small></button>`);
    if (canExecute()) {
      commands.push(`<button class="command-card pending" data-command="pending"><span class="command-icon">◷</span><strong>Solicitações pendentes</strong><small>Aguardando aceite da equipe</small>${pending ? `<b class="command-badge">${pending}</b>` : ''}</button>`);
      commands.push(`<button class="command-card accepted" data-command="accepted"><span class="command-icon">✓</span><strong>Transportes aceitos</strong><small>Em andamento e prontos para concluir</small></button>`);
    }
    commands.push(`<button class="command-card" data-command="all"><span class="command-icon">▤</span><strong>Transportes solicitados</strong><small>Consultar todos os pedidos disponíveis</small></button>`);
    commands.push(`<button class="command-card" data-command="agenda"><span class="command-icon">▦</span><strong>Agenda de transportes</strong><small>Consultar por data programada</small></button>`);
    commands.push(`<button class="command-card done" data-command="history"><span class="command-icon">↶</span><strong>Histórico e finalizados</strong><small>Transportes concluídos e seus horários</small></button>`);
    if (isAdmin()) {
      const waitingUsers = state.profiles.filter((row) => row.status === 'pendente').length;
      commands.push(`<button class="command-card" data-command="users"><span class="command-icon">♟</span><strong>Autorizar usuários</strong><small>Aprovar, bloquear ou reativar acessos</small>${waitingUsers ? `<b class="command-badge">${waitingUsers}</b>` : ''}</button>`);
      commands.push(`<button class="command-card" data-command="settings"><span class="command-icon">⚙</span><strong>Configurações</strong><small>Números oficiais do transporte</small></button>`);
    }
    $('commandCards').innerHTML = commands.join('');
  }

  function setViewMeta(kicker, title, description) {
    $('viewKicker').textContent = kicker; $('viewTitle').textContent = title; $('viewDescription').textContent = description || '';
  }
  function openHome() {
    state.currentView = 'home'; $('dashboard').classList.remove('hidden'); $('viewScreen').classList.add('hidden');
    document.querySelectorAll('#bottomNav button').forEach((button) => button.classList.toggle('active', button.dataset.nav === 'home'));
    renderDashboard(); window.scrollTo(0, 0);
  }
  function openView(view) {
    state.currentView = view; $('dashboard').classList.add('hidden'); $('viewScreen').classList.remove('hidden');
    document.querySelectorAll('#bottomNav button').forEach((button) => button.classList.toggle('active', button.dataset.nav === view || (button.dataset.nav === 'history' && view === 'history')));
    renderCurrentView(); window.scrollTo(0, 0);
  }
  function renderCurrentView() {
    const view = state.currentView;
    if (view === 'new') renderRequestForm();
    else if (view === 'pending') renderRequestList('pending');
    else if (view === 'accepted') renderRequestList('accepted');
    else if (view === 'history') renderRequestList('done');
    else if (view === 'all') renderRequestList('all');
    else if (view === 'agenda') renderAgenda();
    else if (view === 'users') renderUsers();
    else if (view === 'settings') renderSettings();
    else if (view === 'profile') renderProfile();
    else if (view.startsWith('detail:')) renderDetail(view.split(':')[1]);
  }

  function renderRequestForm() {
    if (!canRequest()) { openHome(); return; }
    setViewMeta('Solicitação', 'Nova solicitação de transporte', 'Preencha os dados e envie para a central.');
    $('viewContent').innerHTML = `<form id="requestForm" class="data-panel request-form-panel form-grid" novalidate>
      <label class="span-2">Nome do paciente<input id="reqPatient" required></label>
      <label>Data de nascimento<input id="reqBirthDate" type="date" required></label>
      <label>Setor de origem<select id="reqOrigin" required><option value="">Selecione</option><option>Sala Vermelha</option><option>Clínica Médica</option><option>Clínica Cirúrgica/Ortopédica</option><option>Clínica Geral</option><option>UTI</option><option>Centro Cirúrgico</option><option>Acolhimento</option><option>Outro</option></select></label>
      <div id="reqLocationFields" class="conditional-fields"></div>
      <label class="span-2">Unidade de destino<input id="reqDestination" required></label>
      <label>Data do transporte<input id="reqTransportDate" type="date" value="${todayISO()}" required></label>
      <label>Horário previsto<input id="reqTransportTime" type="time" required></label>
      <label>Tipo de ambulância<select id="reqSupport"><option value="basico">Suporte básico</option><option value="avancado_uti">UTI móvel</option></select></label>
      <label>Prioridade<select id="reqPriority"><option value="eletivo">Programado</option><option value="urgencia">Urgente</option><option value="emergencia">Emergência</option></select></label>
      <label>Necessita oxigênio?<select id="reqOxygen"><option value="false">Não</option><option value="true">Sim</option></select></label>
      <label>Contato do setor solicitante<input id="reqContact" type="tel" inputmode="tel"></label>
      <label class="span-2">Observações<textarea id="reqNotes" placeholder="Informações adicionais para a equipe de transporte"></textarea></label>
      <label class="span-2">Documento ou fotografia da regulação<input id="reqAttachments" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple><small class="help">Imagens serão incorporadas ao PDF. Limite de 20 MB por arquivo.</small></label>
      <div class="span-2"><button class="button primary" type="submit">Enviar solicitação</button><p id="requestMessage" class="form-message"></p></div>
    </form>`;
    renderLocationFields();
  }
  function renderLocationFields() {
    const sector = $('reqOrigin')?.value || '';
    const usesBox = ['Sala Vermelha', 'UTI'].includes(sector);
    const box = $('reqLocationFields'); if (!box) return;
    box.innerHTML = usesBox
      ? '<label class="span-2">Box<input id="reqBox" inputmode="numeric" required></label>'
      : '<label>Enfermaria<input id="reqWard" required></label><label>Leito<input id="reqBed" required></label>';
  }

  function actionButtons(item) {
    const execution = executionFor(item.id);
    const buttons = [`<button class="mini-button detail" data-action="detail" data-id="${item.id}">Detalhes</button>`];
    if (category(item) === 'pending' && canExecute()) buttons.unshift(`<button class="mini-button accept" data-action="accept" data-id="${item.id}">Aceitar</button>`);
    if (category(item) === 'accepted' && canExecute()) {
      const owns = execution?.responsible_id === state.user?.id || isAdmin();
      if (owns) {
        buttons.unshift(`<button class="mini-button unaccept" data-action="unaccept" data-id="${item.id}">Desaceitar</button>`);
        buttons.push(`<button class="mini-button finish" data-action="finish" data-id="${item.id}">Concluir</button>`);
      }
    }
    return `<div class="table-actions">${buttons.join('')}</div>`;
  }
  function requestRow(item, includeStatus = false) {
    const execution = executionFor(item.id);
    return `<tr class="row-${category(item)}">
      ${includeStatus ? `<td><span class="status-pill ${category(item)}">${statusLabel(item)}</span></td>` : ''}
      <td><span class="cell-main">${esc(item.patient_name)}</span><span class="cell-sub">${esc(item.protocol || 'Sem protocolo')}</span></td>
      <td>${formatDateTime(item.created_at)}</td><td>${formatDateTime(execution?.accepted_at)}</td><td>${formatDateTime(execution?.completed_at)}</td>
      <td>${esc(item.origin_sector)}<span class="cell-sub">${esc(locationText(item))}</span></td><td>${esc(item.destination)}</td>
      <td>${formatDate(item.transport_date)} ${esc(String(item.destination_time || '').slice(0, 5))}</td><td>${esc(priorityLabel(item.priority))}</td><td>${actionButtons(item)}</td>
    </tr>`;
  }
  function requestCard(item) {
    const execution = executionFor(item.id);
    return `<article class="request-card ${category(item)}">
      <div class="request-card-head"><div><h3>${esc(item.patient_name)}</h3><span class="cell-sub">${esc(item.protocol || 'Sem protocolo')}</span></div><span class="status-pill ${category(item)}">${statusLabel(item)}</span></div>
      <p><b>Origem:</b> ${esc(item.origin_sector)} — ${esc(locationText(item))}<br><b>Destino:</b> ${esc(item.destination)}</p>
      <p><b>Solicitação:</b> ${formatDateTime(item.created_at)}<br><b>Aceite:</b> ${formatDateTime(execution?.accepted_at)}<br><b>Conclusão:</b> ${formatDateTime(execution?.completed_at)}</p>
      <p><b>Agendado:</b> ${formatDate(item.transport_date)} às ${esc(String(item.destination_time || '').slice(0, 5))} · ${esc(priorityLabel(item.priority))}</p>
      ${actionButtons(item)}
    </article>`;
  }
  function filteredRequests(filter, term = '', date = '') {
    return state.requests.filter((item) => {
      const matchesStatus = filter === 'all' || category(item) === filter;
      const haystack = normalize(`${item.patient_name} ${item.protocol} ${item.origin_sector} ${item.destination} ${item.requester_name}`);
      return matchesStatus && (!term || haystack.includes(normalize(term))) && (!date || item.transport_date === date);
    });
  }
  function renderRequestList(filter) {
    const metas = {
      pending: ['Controle', 'Solicitações pendentes', 'Pedidos aguardando aceite. O botão Aceitar desaparece após a confirmação.'],
      accepted: ['Execução', 'Transportes aceitos', 'Use Desaceitar para devolver à fila ou Concluir para finalizar.'],
      done: ['Histórico', 'Transportes finalizados', 'Consulta dos horários da solicitação, aceite e conclusão.'],
      all: ['Consulta', isAdmin() || canExecute() ? 'Transportes solicitados' : 'Minhas solicitações', 'Consulta geral dos pedidos e seus status.']
    };
    setViewMeta(...metas[filter]);
    const term = $('listSearch')?.value || '';
    const date = $('listDate')?.value || '';
    const data = filteredRequests(filter, term, date);
    const includeStatus = filter === 'all';
    $('viewContent').innerHTML = `<div class="toolbar no-print"><input id="listSearch" type="search" placeholder="Pesquisar paciente, protocolo ou destino" value="${esc(term)}"><input id="listDate" type="date" value="${esc(date)}"><button class="button secondary" data-action="clear-filters">Limpar</button><button class="button secondary" data-action="print-list">Imprimir / PDF</button></div>
      <div class="data-panel"><div class="table-wrap"><table class="data-table"><thead><tr>${includeStatus ? '<th>Status</th>' : ''}<th>Paciente / protocolo</th><th>Horário da solicitação</th><th>Horário do aceite</th><th>Horário da conclusão</th><th>Origem</th><th>Destino</th><th>Agendado</th><th>Prioridade</th><th>Ações</th></tr></thead><tbody>${data.map((item) => requestRow(item, includeStatus)).join('') || `<tr><td colspan="${includeStatus ? 10 : 9}" class="empty-state"><b>Nenhum transporte encontrado.</b>Não há registros para este filtro.</td></tr>`}</tbody></table></div><div class="mobile-list">${data.map(requestCard).join('') || '<div class="empty-state"><b>Nenhum transporte encontrado.</b>Não há registros para este filtro.</div>'}</div></div>`;
  }

  function renderAgenda() {
    setViewMeta('Programação', 'Agenda de transportes', 'Consulte os transportes programados para uma data.');
    const date = $('agendaDate')?.value || todayISO();
    const data = filteredRequests('all', '', date).sort((a, b) => String(a.destination_time || '').localeCompare(String(b.destination_time || '')));
    $('viewContent').innerHTML = `<div class="toolbar no-print"><input id="agendaDate" type="date" value="${date}"><button class="button secondary" data-action="agenda-today">Hoje</button><button class="button secondary" data-action="print-list">Imprimir / PDF</button></div>
      <div class="data-panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Status</th><th>Paciente / protocolo</th><th>Horário da solicitação</th><th>Horário do aceite</th><th>Horário da conclusão</th><th>Origem</th><th>Destino</th><th>Agendado</th><th>Prioridade</th><th>Ações</th></tr></thead><tbody>${data.map((item) => requestRow(item, true)).join('') || '<tr><td colspan="10" class="empty-state"><b>Nenhum transporte nesta data.</b>Escolha outra data para consultar.</td></tr>'}</tbody></table></div><div class="mobile-list">${data.map(requestCard).join('') || '<div class="empty-state"><b>Nenhum transporte nesta data.</b>Escolha outra data para consultar.</div>'}</div></div>`;
  }

  function renderDetail(id) {
    const item = state.requests.find((row) => row.id === id);
    if (!item) { openView('all'); return; }
    const execution = executionFor(id);
    setViewMeta('Detalhes', item.patient_name, item.protocol || 'Solicitação de transporte');
    $('viewContent').innerHTML = `<div class="data-panel detail-panel">
      <div class="timeline"><div class="timeline-item"><b>Horário da solicitação</b>${formatDateTime(item.created_at)}</div><div class="timeline-item"><b>Horário do aceite</b>${formatDateTime(execution?.accepted_at)}</div><div class="timeline-item"><b>Horário da conclusão</b>${formatDateTime(execution?.completed_at)}</div></div>
      <div class="detail-grid">
        <div class="detail-item"><b>Status</b><span class="status-pill ${category(item)}">${statusLabel(item)}</span></div><div class="detail-item"><b>Paciente</b><span>${esc(item.patient_name)}</span></div><div class="detail-item"><b>Nascimento</b><span>${formatDate(item.birth_date)}</span></div>
        <div class="detail-item"><b>Solicitante</b><span>${esc(item.requester_name)}</span></div><div class="detail-item"><b>Origem</b><span>${esc(item.origin_sector)} — ${esc(locationText(item))}</span></div><div class="detail-item"><b>Destino</b><span>${esc(item.destination)}</span></div>
        <div class="detail-item"><b>Data e horário previstos</b><span>${formatDate(item.transport_date)} às ${esc(String(item.destination_time || '').slice(0, 5))}</span></div><div class="detail-item"><b>Ambulância</b><span>${esc(supportLabel(item.support_type))}</span></div><div class="detail-item"><b>Prioridade</b><span>${esc(priorityLabel(item.priority))}</span></div>
        <div class="detail-item"><b>Oxigênio</b><span>${item.oxygen_required ? 'Sim' : 'Não'}</span></div><div class="detail-item"><b>Contato do setor</b><span>${esc(item.requester_contact || 'Não informado')}</span></div><div class="detail-item"><b>Responsável pelo aceite</b><span>${esc(execution?.responsible_name || '—')}</span></div>
        <div class="detail-item wide"><b>Observações</b><span>${esc(item.observations || 'Sem observações')}</span></div><div class="detail-item wide"><b>Anexos</b><span>${item.attachment_paths?.length ? item.attachment_paths.map((path) => esc(path.split('/').pop())).join(', ') : 'Nenhum anexo'}</span></div>
      </div>
      <div class="detail-actions no-print">${category(item) === 'pending' && canExecute() ? `<button class="button warning" data-action="accept" data-id="${id}">Aceitar transporte</button>` : ''}${category(item) === 'accepted' && canExecute() && (execution?.responsible_id === state.user.id || isAdmin()) ? `<button class="button secondary" data-action="unaccept" data-id="${id}">Desaceitar</button><button class="button success" data-action="finish" data-id="${id}">Concluir transporte</button>` : ''}<button class="button secondary" data-action="pdf" data-id="${id}">Baixar PDF</button><button class="button primary" data-action="share" data-id="${id}">Compartilhar PDF</button></div>
    </div>`;
  }

  function renderUsers() {
    if (!isAdmin()) { openHome(); return; }
    setViewMeta('Administração', 'Autorizar usuários', 'Cadastros pendentes e usuários ativos ou bloqueados.');
    const cards = state.profiles.filter((row) => row.id !== state.user.id).map((profile) => {
      const status = profile.status === 'aprovado' ? 'done' : profile.status === 'pendente' ? 'pending' : 'cancelled';
      const requested = profile.institutional_link === 'administracao' ? 'administrador_geral' : (profile.requested_access || 'solicitante');
      return `<article class="data-panel admin-card"><span class="status-pill ${status}">${esc(profile.status)}</span><h3>${esc(profile.full_name)}</h3><p>@${esc(profile.username)} · ${esc(profile.email)}<br>CPF: ${esc(cpfMask(profile.cpf))}<br>Função: ${esc(profile.job_role)}<br>Solicitado: ${esc(roles[requested] || requested)}</p>
        ${profile.status === 'pendente' ? `<label class="field-label">Perfil autorizado<select data-profile-select="${profile.id}" ${profile.institutional_link === 'administracao' ? 'disabled' : ''}><option value="solicitante" ${requested === 'solicitante' ? 'selected' : ''}>Solicitante</option><option value="executante" ${requested === 'executante' ? 'selected' : ''}>Executante</option><option value="solicitante_executante" ${requested === 'solicitante_executante' ? 'selected' : ''}>Solicitante e executante</option>${profile.institutional_link === 'administracao' ? '<option value="administrador_geral" selected>Administrador geral</option>' : ''}</select></label>` : ''}
        <div class="admin-actions">${profile.status === 'pendente' ? `<button class="mini-button finish" data-action="approve-user" data-id="${profile.id}">Autorizar</button><button class="mini-button unaccept" data-action="reject-user" data-id="${profile.id}">Recusar</button>` : ''}${profile.status === 'aprovado' ? `<button class="mini-button unaccept" data-action="block-user" data-id="${profile.id}">Bloquear</button>` : ''}${profile.status === 'bloqueado' ? `<button class="mini-button finish" data-action="reactivate-user" data-id="${profile.id}">Reativar</button>` : ''}</div></article>`;
    }).join('');
    $('viewContent').innerHTML = `<div class="admin-list">${cards || '<div class="data-panel empty-state"><b>Nenhum outro usuário cadastrado.</b></div>'}</div>`;
  }

  function renderSettings() {
    if (!isAdmin()) { openHome(); return; }
    setViewMeta('Administração', 'Configurações', 'Números oficiais usados no encaminhamento pelo WhatsApp.');
    $('viewContent').innerHTML = `<form id="settingsForm" class="data-panel settings-card settings-grid"><label class="field-label">WhatsApp — suporte básico<input id="basicWhatsapp" inputmode="numeric" value="${esc(state.settings?.basic_whatsapp || '')}" placeholder="69999999999"></label><label class="field-label">WhatsApp — UTI móvel<input id="utiWhatsapp" inputmode="numeric" value="${esc(state.settings?.advanced_uti_whatsapp || '')}" placeholder="69999999999"></label><div><button class="button primary" type="submit">Salvar configurações</button></div></form>`;
  }
  function renderProfile() {
    const p = state.profile;
    setViewMeta('Minha conta', 'Perfil do usuário', 'Dados e permissões do acesso atual.');
    $('viewContent').innerHTML = `<div class="data-panel profile-card"><div class="profile-grid"><div><b>Nome</b>${esc(p.full_name)}</div><div><b>Nome de usuário</b>${esc(p.username)}</div><div><b>E-mail</b>${esc(p.email)}</div><div><b>CPF</b>${esc(cpfMask(p.cpf))}</div><div><b>Função</b>${esc(p.job_role)}</div><div><b>Acesso autorizado</b>${esc(roles[p.authorized_access] || p.authorized_access)}</div><div><b>Status</b>${esc(p.status)}</div><div><b>Cadastro aprovado em</b>${formatDateTime(p.approved_at)}</div></div></div>`;
  }

  async function uploadAttachments(files) {
    const paths = [];
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) throw new Error(`O arquivo ${file.name} ultrapassa 20 MB.`);
      if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) throw new Error(`Formato não permitido: ${file.name}.`);
      const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${state.user.id}/${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}-${safeName}`;
      const { error } = await db.storage.from('transport-attachments').upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error; paths.push(path);
    }
    return paths;
  }
  async function submitRequest(form) {
    message('requestMessage', ''); setLoading(true, 'Enviando solicitação...');
    let uploaded = [];
    try {
      if (!form.reportValidity()) return;
      const files = Array.from($('reqAttachments').files || []);
      uploaded = await uploadAttachments(files);
      const sector = $('reqOrigin').value;
      const location = ['Sala Vermelha', 'UTI'].includes(sector) ? `Box: ${$('reqBox').value.trim()}` : `Enfermaria: ${$('reqWard').value.trim()} | Leito: ${$('reqBed').value.trim()}`;
      const priority = $('reqPriority').value;
      const payload = {
        requester_id: state.user.id, requester_name: state.profile.display_name || state.profile.full_name,
        patient_name: $('reqPatient').value.trim(), birth_date: $('reqBirthDate').value,
        origin_sector: sector, origin_location: location, destination: $('reqDestination').value.trim(),
        oxygen_required: $('reqOxygen').value === 'true', observations: $('reqNotes').value.trim() || null,
        attachment_paths: uploaded, status: 'pendente', support_type: $('reqSupport').value, priority,
        priority_rank: priority === 'emergencia' ? 1 : priority === 'urgencia' ? 2 : 3,
        transport_date: $('reqTransportDate').value, destination_time: $('reqTransportTime').value,
        requester_contact: $('reqContact').value.trim() || null,
        protocol: `HEURO-${todayISO().replace(/-/g, '')}-${String(Date.now()).slice(-5)}`
      };
      const { data, error } = await db.from('transport_requests').insert(payload).select('*').single();
      if (error) throw error;
      toast(`Solicitação ${data.protocol} enviada.`, 'success');
      await refreshData({ quiet: true }); openView(`detail:${data.id}`);
    } catch (error) {
      console.error(error); message('requestMessage', friendlyError(error));
      if (uploaded.length) await Promise.allSettled(uploaded.map((path) => db.storage.from('transport-attachments').remove([path])));
    } finally { setLoading(false); }
  }

  async function acceptRequest(id) {
    setLoading(true, 'Registrando aceite...');
    try {
      const { error } = await db.rpc('accept_transport_request', { p_request_id: id, p_vehicle_id: null, p_team_name: null });
      if (error) throw error; toast('Transporte aceito com sucesso.', 'success'); await refreshData({ quiet: true });
    } catch (error) { toast(friendlyError(error), 'error'); } finally { setLoading(false); }
  }
  async function unacceptRequest(id) {
    if (!window.confirm('Desaceitar este transporte e devolvê-lo para a lista de pendentes?')) return;
    setLoading(true, 'Desfazendo aceite...');
    try {
      const { error } = await db.rpc('unaccept_transport_request', { p_request_id: id });
      if (error) throw error; toast('O transporte voltou para pendentes.', 'success'); await refreshData({ quiet: true });
    } catch (error) { toast(friendlyError(error), 'error'); } finally { setLoading(false); }
  }
  async function finishRequest(id) {
    if (!window.confirm('Confirmar a conclusão deste transporte?')) return;
    setLoading(true, 'Concluindo transporte...');
    try {
      const { error } = await db.rpc('change_transport_execution_status', { p_request_id: id, p_new_status: 'concluido', p_notes: null });
      if (error) throw error; toast('Transporte concluído.', 'success'); await refreshData({ quiet: true });
      if (state.currentView === 'accepted' || state.currentView === 'pending') renderCurrentView();
    } catch (error) { toast(friendlyError(error), 'error'); } finally { setLoading(false); }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
  }
  async function buildPdf(item) {
    if (!window.jspdf?.jsPDF) throw new Error('Gerador de PDF indisponível. Atualize a página e tente novamente.');
    const execution = executionFor(item.id);
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const left = 15; let y = 16;
    doc.setTextColor(7, 59, 134); doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text('TRANSPORTE HEURO', left, y); y += 7;
    doc.setTextColor(35, 55, 77); doc.setFontSize(11); doc.text('Solicitação e registro de transporte', left, y); y += 9;
    const rows = [
      ['Protocolo', item.protocol || 'Não informado'], ['Status', statusLabel(item)], ['Paciente', item.patient_name], ['Nascimento', formatDate(item.birth_date)],
      ['Solicitante', item.requester_name], ['Horário da solicitação', formatDateTime(item.created_at)], ['Horário do aceite', formatDateTime(execution?.accepted_at)], ['Horário da conclusão', formatDateTime(execution?.completed_at)],
      ['Origem', `${item.origin_sector} — ${locationText(item)}`], ['Destino', item.destination], ['Data e horário previstos', `${formatDate(item.transport_date)} às ${String(item.destination_time || '').slice(0, 5)}`],
      ['Ambulância', supportLabel(item.support_type)], ['Prioridade', priorityLabel(item.priority)], ['Oxigênio', item.oxygen_required ? 'Sim' : 'Não'], ['Contato', item.requester_contact || 'Não informado'], ['Observações', item.observations || 'Sem observações']
    ];
    doc.setFontSize(9.5);
    for (const [label, value] of rows) {
      if (y > 278) { doc.addPage(); y = 16; }
      doc.setFont('helvetica', 'bold'); doc.setTextColor(65, 83, 103); doc.text(`${label}:`, left, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(25, 45, 66); const lines = doc.splitTextToSize(String(value || '—'), 142); doc.text(lines, 51, y); y += Math.max(6, lines.length * 4.5);
    }
    for (const path of item.attachment_paths || []) {
      try {
        const { data, error } = await db.storage.from('transport-attachments').download(path);
        if (error || !String(data?.type || '').startsWith('image/')) continue;
        const url = await blobToDataUrl(data); if (y > 180) { doc.addPage(); y = 16; }
        doc.setFont('helvetica', 'bold'); doc.text('Fotografia anexada:', left, y); y += 5;
        const format = data.type === 'image/png' ? 'PNG' : data.type === 'image/webp' ? 'WEBP' : 'JPEG';
        doc.addImage(url, format, left, y, 180, 120, undefined, 'FAST'); y += 125;
      } catch (error) { console.warn('Anexo não incorporado ao PDF', error); }
    }
    return new File([doc.output('blob')], `${(item.protocol || 'solicitacao-heuro').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`, { type: 'application/pdf' });
  }
  function downloadFile(file) {
    const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = file.name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1800);
  }
  async function pdfAction(id, share) {
    const item = state.requests.find((row) => row.id === id); if (!item) return;
    setLoading(true, 'Gerando PDF...');
    try {
      const file = await buildPdf(item);
      if (share && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: 'Transporte HEURO', text: `Solicitação ${item.protocol || ''}`, files: [file] });
      } else {
        downloadFile(file);
        if (share) toast('PDF salvo. Abra o WhatsApp e anexe o arquivo.'); else toast('PDF salvo no aparelho.', 'success');
      }
    } catch (error) { if (error?.name !== 'AbortError') toast(friendlyError(error, 'Não foi possível gerar o PDF.'), 'error'); } finally { setLoading(false); }
  }

  async function userAction(action, id) {
    const target = state.profiles.find((row) => row.id === id); if (!target) return;
    try {
      if (action === 'approve-user') {
        const select = document.querySelector(`[data-profile-select="${id}"]`);
        setLoading(true, 'Autorizando usuário...');
        const { error } = await db.rpc('admin_decide_user', { target_user: id, decision: 'aprovar', granted_access: select?.value || null, decision_notes: null });
        if (error) throw error; toast('Usuário autorizado.', 'success');
      } else if (action === 'reject-user') {
        if (!window.confirm(`Recusar e remover o cadastro de ${target.full_name}?`)) return;
        setLoading(true, 'Recusando cadastro...');
        const { error } = await db.rpc('admin_decide_user', { target_user: id, decision: 'rejeitar', granted_access: null, decision_notes: null }); if (error) throw error; toast('Cadastro recusado.', 'success');
      } else if (action === 'block-user') {
        if (!window.confirm(`Bloquear o acesso de ${target.full_name}?`)) return;
        setLoading(true, 'Bloqueando usuário...');
        const { error } = await db.rpc('admin_decide_user', { target_user: id, decision: 'bloquear', granted_access: null, decision_notes: null }); if (error) throw error; toast('Usuário bloqueado.', 'success');
      } else if (action === 'reactivate-user') {
        setLoading(true, 'Reativando usuário...');
        const { error } = await db.rpc('admin_manage_user', { target_user: id, action: 'reativar', notes: null }); if (error) throw error; toast('Usuário reativado.', 'success');
      }
      await refreshData({ quiet: true });
    } catch (error) { toast(friendlyError(error), 'error'); } finally { setLoading(false); }
  }

  async function submitLogin(event) {
    event.preventDefault(); message('loginMessage', '');
    if (!db) return message('loginMessage', 'A central em nuvem não foi carregada. Atualize a página.');
    const identifier = $('loginIdentifier').value.trim(); const password = $('loginPassword').value;
    if (!identifier || !password) return message('loginMessage', 'Informe CPF/e-mail e senha.');
    setLoading(true, 'Entrando...');
    try {
      let email = identifier;
      if (!identifier.includes('@')) {
        const { data, error } = await db.rpc('resolve_login_email', { login_cpf: digits(identifier) });
        if (error || !data) throw new Error('CPF/e-mail ou senha incorretos.');
        email = data;
      }
      const { data, error } = await db.auth.signInWithPassword({ email: normalize(email), password });
      if (error) throw error;
      await ensureApproved(data.user);
      if ($('rememberLogin').checked) localStorage.setItem('heuroLoginIdentifier', identifier); else localStorage.removeItem('heuroLoginIdentifier');
      $('loginPassword').value = ''; await enterApplication();
    } catch (error) { message('loginMessage', friendlyError(error)); }
    finally { setLoading(false); }
  }
  async function submitRegistration(event) {
    event.preventDefault(); message('registerMessage', '');
    const form = event.currentTarget; if (!form.reportValidity()) return;
    const cpf = digits($('regCpf').value); const password = $('regPassword').value;
    if (!validCpf(cpf)) return message('registerMessage', 'Informe um CPF válido.');
    if (password !== $('regPasswordConfirm').value) return message('registerMessage', 'As senhas não coincidem.');
    const link = $('regLink').value;
    if (link === 'heuro' && !$('regSector').value.trim()) return message('registerMessage', 'Informe o setor do HEURO.');
    if (link === 'empresa' && !$('regCompany').value.trim()) return message('registerMessage', 'Informe a empresa de transporte.');
    setLoading(true, 'Enviando cadastro...');
    try {
      const fullName = $('regFullName').value.trim();
      const metadata = { username: $('regUsername').value.trim(), full_name: fullName, display_name: $('regDisplayName').value.trim() || fullName, cpf, phone: digits($('regPhone').value), birth_date: $('regBirthDate').value, institutional_link: link, heuro_sector: link === 'heuro' ? $('regSector').value.trim() : null, transport_company: link === 'empresa' ? $('regCompany').value.trim() : null, job_role: $('regJobRole').value.trim(), requested_access: link === 'administracao' ? 'administrador_geral' : $('regAccess').value };
      const { error } = await db.auth.signUp({ email: normalize($('regEmail').value), password, options: { data: metadata } });
      if (error) throw error;
      await db.auth.signOut(); form.reset(); updateRegisterFields(); showScreen('loginScreen');
      message('loginMessage', 'Cadastro enviado. Aguarde a autorização de um administrador.', 'success');
    } catch (error) { message('registerMessage', friendlyError(error)); }
    finally { setLoading(false); }
  }
  function updateRegisterFields() {
    const link = $('regLink').value; $('regSectorField').classList.toggle('hidden', link !== 'heuro'); $('regCompanyField').classList.toggle('hidden', link !== 'empresa'); $('regAccessField').classList.toggle('hidden', link === 'administracao');
    $('regSector').required = link === 'heuro'; $('regCompany').required = link === 'empresa'; $('regAccess').required = link !== 'administracao';
  }
  async function logout() {
    setLoading(true, 'Saindo...');
    try { if (state.realtime) db.removeChannel(state.realtime); clearInterval(state.refreshTimer); await db.auth.signOut(); }
    finally { state.user = null; state.profile = null; state.requests = []; state.executions = []; setLoading(false); showScreen('welcomeScreen'); }
  }

  async function bootSession() {
    if (!db) return;
    const { data } = await db.auth.getSession();
    if (data.session?.user) {
      try { await ensureApproved(data.session.user); }
      catch (_) { /* a mensagem será exibida no próximo acesso */ }
    }
  }
  async function handleWelcomeEnter(changeUser = false) {
    if (!db) { showScreen('loginScreen'); message('loginMessage', 'A central em nuvem não carregou. Verifique a internet e atualize a página.'); return; }
    if (changeUser) { await db.auth.signOut(); state.user = null; state.profile = null; showScreen('loginScreen'); return; }
    if (state.user && isApproved()) { await enterApplication(); return; }
    const { data } = await db.auth.getSession();
    if (data.session?.user) {
      setLoading(true, 'Validando acesso...');
      try { await ensureApproved(data.session.user); await enterApplication(); return; }
      catch (error) { message('loginMessage', friendlyError(error)); }
      finally { setLoading(false); }
    }
    showScreen('loginScreen');
  }

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-toggle-password]');
    if (toggle) { const input = $(toggle.dataset.togglePassword); const show = input.type === 'password'; input.type = show ? 'text' : 'password'; toggle.textContent = show ? 'Ocultar' : 'Mostrar'; return; }
    if (event.target.closest('[data-go-welcome]')) { showScreen('welcomeScreen'); return; }
    const command = event.target.closest('[data-command]'); if (command) { openView(command.dataset.command); return; }
    const nav = event.target.closest('[data-nav]'); if (nav) { nav.dataset.nav === 'home' ? openHome() : openView(nav.dataset.nav); return; }
    const action = event.target.closest('[data-action]'); if (!action) return;
    const { action: name, id } = action.dataset;
    if (name === 'detail') openView(`detail:${id}`);
    else if (name === 'accept') acceptRequest(id);
    else if (name === 'unaccept') unacceptRequest(id);
    else if (name === 'finish') finishRequest(id);
    else if (name === 'pdf') pdfAction(id, false);
    else if (name === 'share') pdfAction(id, true);
    else if (['approve-user', 'reject-user', 'block-user', 'reactivate-user'].includes(name)) userAction(name, id);
    else if (name === 'clear-filters') { if ($('listSearch')) $('listSearch').value = ''; if ($('listDate')) $('listDate').value = ''; renderCurrentView(); }
    else if (name === 'agenda-today') { $('agendaDate').value = todayISO(); renderAgenda(); }
    else if (name === 'print-list') window.print();
  });
  let searchTimer;
  document.addEventListener('input', (event) => {
    if (event.target.id === 'regCpf') event.target.value = cpfMask(event.target.value);
    if (event.target.id === 'listSearch') {
      const value = event.target.value; clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        renderRequestList(state.currentView === 'history' ? 'done' : state.currentView);
        const input = $('listSearch'); if (input) { input.focus(); input.setSelectionRange(value.length, value.length); }
      }, 220);
    }
  });
  document.addEventListener('change', (event) => {
    if (event.target.id === 'regLink') updateRegisterFields();
    if (event.target.id === 'reqOrigin') renderLocationFields();
    if (event.target.id === 'listDate') renderRequestList(state.currentView === 'history' ? 'done' : state.currentView);
    if (event.target.id === 'agendaDate') renderAgenda();
  });
  document.addEventListener('submit', async (event) => {
    if (event.target.id === 'requestForm') { event.preventDefault(); await submitRequest(event.target); }
    if (event.target.id === 'settingsForm') {
      event.preventDefault(); setLoading(true, 'Salvando configurações...');
      try { const { error } = await db.from('transport_app_settings').update({ basic_whatsapp: digits($('basicWhatsapp').value) || null, advanced_uti_whatsapp: digits($('utiWhatsapp').value) || null, updated_by: state.user.id, updated_at: new Date().toISOString() }).eq('id', 1); if (error) throw error; toast('Configurações salvas.', 'success'); await refreshData({ quiet: true }); }
      catch (error) { toast(friendlyError(error), 'error'); } finally { setLoading(false); }
    }
  });

  $('welcomeEnter').addEventListener('click', () => handleWelcomeEnter(false));
  $('welcomeChangeUser').addEventListener('click', () => handleWelcomeEnter(true));
  $('loginForm').addEventListener('submit', submitLogin);
  $('openRegister').addEventListener('click', () => { message('registerMessage', ''); showScreen('registerScreen'); });
  $('registerBack').addEventListener('click', () => showScreen('loginScreen'));
  $('registerForm').addEventListener('submit', submitRegistration);
  $('viewBack').addEventListener('click', openHome);
  $('refreshButton').addEventListener('click', () => refreshData());
  $('logoutButton').addEventListener('click', logout);
  window.addEventListener('online', () => { updateConnection(); refreshData({ quiet: true }); });
  window.addEventListener('offline', updateConnection);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && state.user && isApproved()) refreshData({ quiet: true }); });

  const remembered = localStorage.getItem('heuroLoginIdentifier'); if (remembered) $('loginIdentifier').value = remembered;
  updateConnection(); updateRegisterFields(); bootSession();
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js?v=20260807-1').catch(console.warn));
})();
