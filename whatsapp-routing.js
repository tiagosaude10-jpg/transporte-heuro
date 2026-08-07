(()=>{
  'use strict';

  // Mantém o módulo de WhatsApp já existente, carregado da versão estável anterior.
  const legacy=document.createElement('script');
  legacy.src='https://cdn.jsdelivr.net/gh/tiagosaude10-jpg/transporte-heuro@790f2b82eac8a042c387c0912e1a36fc072c084a/whatsapp-routing.js';
  legacy.async=false;
  document.head.appendChild(legacy);

  function openSolicitados(){
    const pending=document.getElementById('v2Pending')||document.getElementById('cmdPending');
    if(pending){
      pending.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
      return;
    }
    if(typeof window.showView==='function'){
      window.showView('listView');
      return;
    }
    const bridge=document.getElementById('v2ListBridge');
    if(bridge) bridge.click();
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('#v2Transport,#cmdTransport,#transportNavCard');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openSolicitados();
  },true);
})();
