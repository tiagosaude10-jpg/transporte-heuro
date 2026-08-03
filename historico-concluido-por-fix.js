(()=>{
'use strict';
const read=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const completedBy=i=>i.completedBy||i.concludedBy||i.finalizedBy||i.finishedBy||i.completedByName||i.concludedByName||i.finalizedByName||'Não informado';
function apply(){
  const root=document.getElementById('historyAdvanced');
  if(!root)return;
  const data=read();
  root.querySelectorAll('.history-card').forEach(card=>{
    if(card.querySelector('.history-completed-by'))return;
    const check=card.querySelector('[data-history-id]');
    if(!check)return;
    const item=data.find(x=>String(x.id)===String(check.dataset.historyId));
    if(!item)return;
    const p=document.createElement('p');
    p.className='history-completed-by';
    p.innerHTML=`<b>Concluído por:</b> ${esc(completedBy(item))}`;
    const accepted=[...card.querySelectorAll('p')].find(el=>el.textContent.trim().startsWith('Aceito por:'));
    if(accepted)accepted.insertAdjacentElement('afterend',p);
    else card.querySelector('.history-meta')?.insertAdjacentElement('beforebegin',p);
  });
}
new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('click',e=>{if(e.target.closest('#cmdHistory'))setTimeout(apply,50)},true);
apply();
})();