(()=>{
'use strict';
const STYLE_ID='heuro-status-colors-v1';
function install(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
:root{
  --heuro-pendente:#c62828;
  --heuro-pendente-escuro:#991b1b;
  --heuro-pendente-claro:#fdecec;
  --heuro-aceito:#e97800;
  --heuro-aceito-escuro:#b45309;
  --heuro-aceito-claro:#fff1df;
  --heuro-finalizado:#198754;
  --heuro-finalizado-escuro:#11663f;
  --heuro-finalizado-claro:#e7f6ee;
}
#openPendingTeam{background:linear-gradient(135deg,var(--heuro-pendente),var(--heuro-pendente-escuro))!important}
#openAcceptedTeam{background:linear-gradient(135deg,#f59e0b,var(--heuro-aceito))!important}
#openFinalizedTeam{background:linear-gradient(135deg,#21a366,var(--heuro-finalizado-escuro))!important}
.quick-card.pending{background:linear-gradient(145deg,#dc3b3b,var(--heuro-pendente-escuro))!important;border-color:#8f1717!important}
.quick-card.accepted{background:linear-gradient(145deg,#f59e0b,var(--heuro-aceito))!important;border-color:#b45309!important}
.quick-card.done{background:linear-gradient(145deg,#25a85d,var(--heuro-finalizado-escuro))!important;border-color:#0f5b37!important}
.quick-status{background:var(--heuro-pendente-escuro)!important}
.quick-status.accepted{background:var(--heuro-aceito-escuro)!important}
.quick-status.done{background:var(--heuro-finalizado-escuro)!important}
.status-pending{background:var(--heuro-pendente)!important}
.status-accepted{background:var(--heuro-aceito)!important}
.pending-sheet-table tr.pending-row td{background:var(--heuro-pendente-claro)!important}
.pending-sheet-table tr.accepted-row td{background:var(--heuro-aceito-claro)!important}
#searchFinalizedDate{background:var(--heuro-finalizado)!important}
.detail-action.accept{background:var(--heuro-aceito)!important}
.detail-action.execute{background:var(--heuro-aceito-escuro)!important}
.detail-action.conclude{background:var(--heuro-finalizado)!important}
#teamListNew [data-table-key="waiting"] h3{color:var(--heuro-pendente)!important}
#teamListNew [data-table-key="accepted"] h3{color:var(--heuro-aceito)!important}
#teamListNew [data-table-key="completed"] h3{color:var(--heuro-finalizado)!important}
#teamListNew tr[data-row-id] strong{font-weight:900}
#teamListNew tr[data-row-id]:has(strong){transition:background .15s ease}
`;
  document.head.appendChild(style);
}
function paintDynamic(){
  install();
  document.querySelectorAll('#teamListNew tr').forEach(row=>{
    const text=(row.textContent||'').toLowerCase();
    if(text.includes('concluído')||text.includes('concluido')) row.style.setProperty('--row-status-bg','var(--heuro-finalizado-claro)');
    else if(text.includes('aceito')||text.includes('em deslocamento')||text.includes('em andamento')) row.style.setProperty('--row-status-bg','var(--heuro-aceito-claro)');
    else if(text.includes('solicitado')) row.style.setProperty('--row-status-bg','var(--heuro-pendente-claro)');
  });
}
new MutationObserver(paintDynamic).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('pageshow',paintDynamic);
paintDynamic();
})();

// Enquadramento proporcional aplicado exclusivamente à tela de login.
(()=>{
'use strict';
const ID='heuro-login-enquadramento-v2';
if(document.getElementById(ID))return;
const style=document.createElement('style');
style.id=ID;
style.textContent=`
#loginNew.active{
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:100dvh!important;
  padding:0!important;
  overflow:hidden!important;
  background:#063b91!important;
}
#loginNew.active>.login-wrap{
  position:relative!important;
  width:100vw!important;
  height:auto!important;
  min-height:0!important;
  max-width:none!important;
  aspect-ratio:941 / 1672!important;
  margin:12px auto 0!important;
  padding:0!important;
  background-position:center top!important;
  background-size:100% 100%!important;
  background-repeat:no-repeat!important;
  background-color:#063b91!important;
}
`;
document.head.appendChild(style);
})();
