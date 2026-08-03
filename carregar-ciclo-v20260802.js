(()=>{
'use strict';
const inject=code=>{const s=document.createElement('script');s.textContent=code;document.body.appendChild(s)};

const cycleUrl=`ciclo-transporte-novo.js?build=20260803-0229-${Date.now()}`;
fetch(cycleUrl,{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('Falha ao carregar módulo da equipe');return r.text()})
  .then(inject)
  .catch(error=>{console.error(error);alert('Não foi possível atualizar o módulo Transportes da equipe. Feche e abra o aplicativo novamente.')});

// O arquivo antigo de ações rápidas também escuta o botão Agenda no document.
// A agenda avançada precisa interceptar no window (etapa anterior da propagação),
// evitando que a tela antiga abra e deixe a rolagem travada.
if(!document.getElementById('agendaTransporteAvancadaScript')){
  const marker=document.createElement('meta');
  marker.id='agendaTransporteAvancadaScript';
  document.head.appendChild(marker);
  fetch(`agenda-transporte-avancada.js?v=2-${Date.now()}`,{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error('Falha ao carregar agenda avançada');return r.text()})
    .then(code=>{
      const original="document.addEventListener('click',e=>{if(e.target.closest('#cmdAgenda'))";
      const corrected="window.addEventListener('click',e=>{if(e.target.closest('#cmdAgenda'))";
      if(!code.includes(original))throw new Error('Ponto de abertura da agenda não localizado');
      inject(code.replace(original,corrected));
    })
    .catch(error=>{
      console.error(error);
      marker.remove();
      alert('Não foi possível abrir a agenda atualizada. Feche e abra o aplicativo novamente.');
    });
}
})();