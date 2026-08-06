(() => {
  'use strict';
  const config = window.HEURO_SUPABASE_CONFIG;
  if (!config || !window.supabase) {
    console.error('Configuração do Supabase ausente.');
    return;
  }
  window.heuroCloud = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();