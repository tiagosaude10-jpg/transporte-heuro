(() => {
  'use strict';
  const config = window.HEURO_SUPABASE_CONFIG;
  if (!config || !window.supabase) return;
  const db = window.heuroCloud = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const $ = (id) => document.getElementById(id);
  const screens = ['welcomeScreen','loginScreen','registerScreen','registerDetailsScreen','homeScreen'];
  const views = ['requestView','listView','usersView','settingsView','detailView'];

  function showScreen(id) {
    screens.forEach((item) => $(item)?.classList.toggle('active', item === id));
    window.scrollTo(0, 0);
  }
  function showDashboard() {
    $('dashboard')?.classList.remove('hidden');
    views.forEach((item) => $(item)?.classList.add('hidden'));
  }
  function setMessage(id, text, type = 'error') {
    const el = $(id); if (!el) return;
    el.textContent = text; el.className = `form-message ${type}`;
  }
  async function enter(user) {
    await window.heuroCloudAuth.enter(user);
    showScreen('homeScreen');
    showDashboard();
  }
  async function login(event) {
    event.preventDefault(); event.stopImmediatePropagation();
    const email = $('userName').value.trim().toLowerCase();
    if (!email.includes('@')) return setMessage('loginMessage', 'Digite o e-mail cadastrado.');
    const result = await db.auth.signInWithPassword({ email, password: $('password').value });
    if (result.error) return setMessage('loginMessage', 'E-mail ou senha incorretos.');
    try { await enter(result.data.user); }
    catch (error) { setMessage('loginMessage', error.message || 'Não foi possível validar seu acesso.'); }
  }
  function wire() {
    const label = document.querySelector('label[for="userName"]');
    if (label) label.textContent = 'E-mail';
    $('userName').type = 'email'; $('userName').placeholder = 'E-mail cadastrado';
    $('loginForm').addEventListener('submit', login, true);
    $('welcomeEnter').addEventListener('click', (event) => { event.stopImmediatePropagation(); showScreen('loginScreen'); }, true);
    $('welcomeChangeUser').addEventListener('click', async (event) => { event.stopImmediatePropagation(); await db.auth.signOut(); showScreen('loginScreen'); }, true);
    $('logoutButton').addEventListener('click', async (event) => { event.stopImmediatePropagation(); await db.auth.signOut(); showScreen('welcomeScreen'); }, true);
  }
  async function boot() {
    wire();
    const sessionResult = await db.auth.getSession();
    if (sessionResult.data.session?.user) {
      try { await enter(sessionResult.data.session.user); }
      catch (error) { setMessage('loginMessage', error.message); showScreen('loginScreen'); }
    }
  }
  window.heuroCloudUi = { showScreen, showDashboard, setMessage };
  boot();
})();