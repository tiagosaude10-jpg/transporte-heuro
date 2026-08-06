(() => {
  'use strict';

  const db = window.heuroCloud;
  if (!db) {
    console.error('Supabase não inicializado.');
    return;
  }

  const $ = (id) => document.getElementById(id);
  const roleMap = {
    solicitante: 'solicitante',
    executante: 'transporte',
    solicitante_executante: 'administrador',
    administrador_geral: 'administrador'
  };

  function legacySession(profile) {
    return {
      id: profile.id,
      name: profile.display_name || profile.full_name || profile.username,
      username: profile.username || profile.email,
      profile: roleMap[profile.authorized_access] || 'solicitante'
    };
  }

  function setMessage(id, text, type = 'error') {
    const el = $(id);
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`;
  }

  async function loadProfile(userId) {
    const { data, error } = await db.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  }

  function mapRequest(row) {
    const location = row.origin_location || '';
    const boxMatch = location.match(/box\s*:?\s*(.+)/i);
    const wardMatch = location.match(/enfermaria\s*:?\s*([^|\n]+)/i);
    const bedMatch = location.match(/leito\s*:?\s*([^|\n]+)/i);
    return {
      id: row.id,
      protocol: row.protocol || `HEURO-${String(row.id).slice(0, 8)}`,
      status: row.status === 'executado' ? 'Concluído' : row.status === 'cancelado' ? 'Cancelado' : 'Solicitado',
      createdAt: row.created_at,
      requester: row.requester_name,
      requesterId: row.requester_id,
      patient: row.patient_name,
      birthDate: row.birth_date,
      originSector: row.origin_sector,
      boxNumber: boxMatch ? boxMatch[1].trim() : '',
      ward: wardMatch ? wardMatch[1].trim() : '',
      bed: bedMatch ? bedMatch[1].trim() : '',
      destination: row.destination,
      transportDate: row.transport_date,
      transportTime: row.destination_time ? String(row.destination_time).slice(0, 5) : '',
      ambulanceType: row.support_type === 'avancado_uti' ? 'UTI' : 'Suporte básico',
      priority: row.priority === 'emergencia' ? 'Emergência' : row.priority === 'urgencia' ? 'Urgente' : 'Programado',
      oxygen: row.oxygen_required ? 'Sim' : 'Não',
      contact: '',
      notes: row.observations || '',
      attachmentName: Array.isArray(row.attachment_paths) && row.attachment_paths.length ? row.attachment_paths.join(', ') : 'Nenhum documento informado'
    };
  }

  async function syncCloudRequests() {
    const { data, error } = await db.from('transport_requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    localStorage.setItem('heuroRequests', JSON.stringify((data || []).map(mapRequest)));
  }

  async function syncCloudUsers() {
    const profile = window.heuroState && window.heuroState.profile;
    if (!profile || profile.authorized_access !== 'administrador_geral') return;
    const { data, error } = await db.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const users = (data || []).map((p) => ({
      id: p.id,
      fullName: p.full_name,
      cpf: p.cpf,
      email: p.email,
      phone: p.phone,
      username: p.username,
      password: '',
      profile: roleMap[p.authorized_access || p.requested_access] || 'solicitante',
      status: p.status === 'aprovado' ? 'ativo' : p.status === 'rejeitado' ? 'recusado' : p.status === 'bloqueado' ? 'bloqueado' : 'aguardando',
      createdAt: p.created_at,
      approvedAt: p.approved_at,
      approvedBy: p.approved_by
    }));
    localStorage.setItem('heuroUsers', JSON.stringify(users));
  }

  async function enterCloudSession(user) {
    const profile = await loadProfile(user.id);
    if (profile.status !== 'aprovado' || !profile.authorized_access) {
      await db.auth.signOut();
      throw new Error(profile.status === 'bloqueado' ? 'Seu acesso está bloqueado.' : 'Seu cadastro ainda aguarda autorização.');
    }
    window.heuroState = { user, profile };
    const mapped = legacySession(profile);
    sessionStorage.setItem('heuroSession', JSON.stringify(mapped));
    await Promise.all([syncCloudRequests(), syncCloudUsers()]);
    if (typeof window.enterHome === 'function') window.enterHome(mapped);
    return profile;
  }

  async function cloudLogin(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    setMessage('loginMessage', 'Entrando...', 'success');
    try {
      const email = $('userName').value.trim();
      const password = $('password').value;
      if (!email.includes('@')) throw new Error('Digite o e-mail cadastrado no campo de usuário.');
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await enterCloudSession(data.user);
      setMessage('loginMessage', '', 'success');
    } catch (error) {
      setMessage('loginMessage', error.message || 'Não foi possível entrar.');
    }
  }

  async function uploadAttachment(file, userId) {
    if (!file) return [];
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${Date.now()}-${safeName}`;
    const { error } = await db.storage.from('transport-attachments').upload(path, file, { upsert: false });
    if (error) throw error;
    return [path];
  }

  async function cloudRequestSubmit(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const profile = window.heuroState && window.heuroState.profile;
    if (!profile) return alert('Sessão expirada. Entre novamente.');
    try {
      const file = $('attachment').files[0];
      const paths = await uploadAttachment(file, profile.id);
      const usesBox = ['Sala Vermelha', 'UTI'].includes($('originSector').value);
      const location = usesBox
        ? `Box: ${$('boxNumber').value.trim()}`
        : `Enfermaria: ${$('ward').value.trim()} | Leito: ${$('bed').value.trim()}`;
      const priority = $('priority').value === 'Emergência' ? 'emergencia' : $('priority').value === 'Urgente' ? 'urgencia' : 'eletivo';
      const priorityRank = priority === 'emergencia' ? 1 : priority === 'urgencia' ? 2 : 3;
      const payload = {
        requester_id: profile.id,
        requester_name: profile.display_name || profile.full_name || profile.username,
        patient_name: $('patient').value.trim(),
        birth_date: $('birthDate').value || null,
        origin_sector: $('originSector').value,
        origin_location: location,
        destination: $('destination').value.trim(),
        oxygen_required: $('oxygen').value === 'Sim',
        observations: $('notes').value.trim() || null,
        attachment_paths: paths,
        status: 'pendente',
        support_type: $('ambulanceType').value === 'UTI' ? 'avancado_uti' : 'basico',
        priority,
        priority_rank: priorityRank,
        transport_date: $('transportDate').value || null,
        destination_time: $('transportTime').value || null,
        protocol: `HEURO-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Date.now()).slice(-5)}`
      };
      const { data, error } = await db.from('transport_requests').insert(payload).select('*').single();
      if (error) throw error;
      await syncCloudRequests();
      $('requestForm').reset();
      if (typeof window.updateOriginLocation === 'function') window.updateOriginLocation();
      alert(`Solicitação ${data.protocol} salva na nuvem.`);
      if (typeof window.openDetail === 'function') window.openDetail(data.id);
    } catch (error) {
      alert(`Não foi possível salvar na nuvem: ${error.message || error}`);
    }
  }

  async function cloudAdminAction(button, action) {
    const id = button.dataset[action];
    if (!id) return;
    const profileSelect = document.querySelector(`[data-profile="${id}"]`);
    const legacyProfile = profileSelect ? profileSelect.value : 'solicitante';
    const access = legacyProfile === 'administrador' ? 'administrador_geral' : legacyProfile === 'transporte' ? 'executante' : 'solicitante';
    const status = action === 'approve' ? 'aprovado' : action === 'reject' ? 'rejeitado' : 'bloqueado';
    const patch = { status, authorized_access: action === 'approve' ? access : null, updated_at: new Date().toISOString() };
    if (action === 'approve') patch.approved_at = new Date().toISOString();
    if (action === 'reject') patch.rejected_at = new Date().toISOString();
    if (action === 'block') patch.blocked_at = new Date().toISOString();
    const { error } = await db.from('profiles').update(patch).eq('id', id);
    if (error) throw error;
    await syncCloudUsers();
    if (typeof window.renderUsers === 'function') window.renderUsers();
  }

  async function init() {
    const login = $('loginForm');
    const request = $('requestForm');
    if (login) {
      const label = document.querySelector('label[for="userName"]');
      if (label) label.textContent = 'E-mail';
      $('userName').type = 'email';
      $('userName').autocomplete = 'email';
      login.addEventListener('submit', cloudLogin, true);
    }
    if (request) request.addEventListener('submit', cloudRequestSubmit, true);

    document.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-approve],[data-reject],[data-block]');
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        if (button.dataset.approve) await cloudAdminAction(button, 'approve');
        else if (button.dataset.reject) await cloudAdminAction(button, 'reject');
        else await cloudAdminAction(button, 'block');
      } catch (error) {
        alert(`Não foi possível atualizar o usuário: ${error.message || error}`);
      }
    }, true);

    const { data } = await db.auth.getSession();
    if (data.session && data.session.user) {
      try { await enterCloudSession(data.session.user); } catch (error) { console.error(error); }
    }

    const logout = $('logoutButton');
    if (logout) logout.addEventListener('click', async () => { await db.auth.signOut(); }, true);
  }

  init().catch((error) => console.error('Falha ao iniciar integração Supabase:', error));
})();