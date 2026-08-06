(() => {
  'use strict';
  const db = window.heuroCloud;
  const $ = (id) => document.getElementById(id);
  const state = window.heuroState = { user: null, profile: null };
  const roles = { solicitante:'Solicitante de transporte', executante:'Executante de transporte', solicitante_executante:'Solicitante e executante', administrador_geral:'Administrador geral' };

  async function loadProfile(id) {
    const result = await db.from('profiles').select('*').eq('id', id).single();
    if (result.error) throw result.error;
    return result.data;
  }

  async function enter(user) {
    const profile = await loadProfile(user.id);
    if (profile.status !== 'aprovado' || !profile.authorized_access) {
      await db.auth.signOut();
      throw new Error(profile.status === 'bloqueado' ? 'Seu acesso está bloqueado.' : 'Seu cadastro ainda aguarda autorização.');
    }
    state.user = user;
    state.profile = profile;
    $('welcomeName').textContent = `Olá, ${profile.display_name || profile.full_name || profile.username}`;
    $('welcomeRole').textContent = roles[profile.authorized_access] || profile.authorized_access;
    $('usersCard').classList.toggle('hidden', profile.authorized_access !== 'administrador_geral');
    $('settingsCard').classList.toggle('hidden', profile.authorized_access !== 'administrador_geral');
  }

  window.heuroCloudAuth = { loadProfile, enter, roles };
})();