(()=>{
'use strict';
const cycleUrl=`ciclo-transporte-novo.js?build=20260802-1101-${Date.now()}`;
fetch(cycleUrl,{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('Falha ao carregar módulo da equipe');return r.text()})
  .then(code=>{const s=document.createElement('script');s.textContent=code;document.body.appendChild(s)})
  .catch(error=>{console.error(error);alert('Não foi possível atualizar o módulo Transportes da equipe. Feche e abra o aplicativo novamente.')});

// Carrega exclusivamente o painel avançado do botão Agenda de transportes.
if(!document.getElementById('agendaTransporteAvancadaScript')){
  const agenda=document.createElement('script');
  agenda.id='agendaTransporteAvancadaScript';
  agenda.src=`agenda-transporte-avancada.js?v=1-${Date.now()}`;
  agenda.async=false;
  document.body.appendChild(agenda);
}
})();