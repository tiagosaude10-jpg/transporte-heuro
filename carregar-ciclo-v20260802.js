(()=>{
'use strict';
const inject=code=>{const s=document.createElement('script');s.textContent=code;document.body.appendChild(s)};

const cycleUrl=`ciclo-transporte-novo.js?build=20260803-0545-${Date.now()}`;
fetch(cycleUrl,{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('Falha ao carregar módulo da equipe');return r.text()})
  .then(inject)
  .catch(error=>{console.error(error);alert('Não foi possível atualizar o módulo Transportes da equipe. Feche e abra o aplicativo novamente.')});

if(!document.getElementById('requestFormEnquadramentoCss')){
  const link=document.createElement('link');
  link.id='requestFormEnquadramentoCss';
  link.rel='stylesheet';
  link.href=`request-form-enquadramento.css?v=5-${Date.now()}`;
  document.head.appendChild(link);
}
if(!document.getElementById('requestDateTimeControlsScript')){
  const script=document.createElement('script');
  script.id='requestDateTimeControlsScript';
  script.src=`request-date-time-controls.js?v=2-${Date.now()}`;
  script.async=false;
  document.body.appendChild(script);
}

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

if(!document.getElementById('historicoTransporteAvancadoScript')){
  const script=document.createElement('script');
  script.id='historicoTransporteAvancadoScript';
  script.src=`historico-transporte-avancado.js?v=1-${Date.now()}`;
  script.async=false;
  document.body.appendChild(script);
}
if(!document.getElementById('historicoConcluidosV2Script')){
  const script=document.createElement('script');
  script.id='historicoConcluidosV2Script';
  script.src=`historico-concluidos-v2.js?v=1-${Date.now()}`;
  script.async=false;
  document.body.appendChild(script);
}
if(!document.getElementById('historicoConcluidoPorFixScript')){
  const script=document.createElement('script');
  script.id='historicoConcluidoPorFixScript';
  script.src=`historico-concluido-por-fix.js?v=1-${Date.now()}`;
  script.async=false;
  document.body.appendChild(script);
}
if(!document.getElementById('historicoFiltrosAlturaCss')){
  const link=document.createElement('link');
  link.id='historicoFiltrosAlturaCss';
  link.rel='stylesheet';
  link.href=`historico-filtros-altura.css?v=1-${Date.now()}`;
  document.head.appendChild(link);
}
if(!document.getElementById('solicitadosPlanilhaReadonlyScript')){
  const script=document.createElement('script');
  script.id='solicitadosPlanilhaReadonlyScript';
  script.src=`solicitados-planilha-readonly.js?v=2-${Date.now()}`;
  script.async=false;
  document.body.appendChild(script);
}
})();