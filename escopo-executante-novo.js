(()=>{
'use strict';
const normalize=()=>{
  try{
    const data=JSON.parse(localStorage.getItem('heuroRequests')||'[]');
    let changed=false;
    data.forEach(item=>{
      if(item.status==='Em deslocamento'){
        item.status='Aceito';
        changed=true;
      }
    });
    if(changed)localStorage.setItem('heuroRequests',JSON.stringify(data));
  }catch(error){console.error('Falha ao normalizar status do transporte',error)}
};
const cleanButtons=()=>{
  document.querySelectorAll('.detail-action.execute,.detail-action.running,[data-status="Em deslocamento"]').forEach(button=>button.remove());
};
normalize();
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-status="Em deslocamento"]');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
},true);
const observer=new MutationObserver(cleanButtons);
observer.observe(document.documentElement,{subtree:true,childList:true});
cleanButtons();
})();