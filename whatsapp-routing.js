(() => {
  'use strict';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
      document.head.appendChild(script);
    });
  }

  (async () => {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      await loadScript('./supabase-config.js');
      await loadScript('./cloud-app.js');
      await loadScript('./cloud-auth.js');
      await loadScript('./cloud-runtime.js');
      await loadScript('./android-pdf-fix.js?v=1');
      console.info('Integração HEURO + Supabase carregada.');
    } catch (error) {
      console.error('Não foi possível iniciar a integração em nuvem:', error);
      alert('Não foi possível conectar o aplicativo à central em nuvem. Verifique a internet e tente novamente.');
    }
  })();
})();