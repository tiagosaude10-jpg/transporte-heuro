(()=>{
'use strict';
const $=id=>document.getElementById(id);
const session=()=>{try{return JSON.parse(sessionStorage.getItem('heuroSession')||'null')}catch{return null}};
function applyPermissions(){
  const profile=session()?.profile||'';
  const isAdmin=profile==='administrador';
  const isRequester=profile==='solicitante';
  const isExecutor=profile==='transporte';
  const newRequest=$('cmdNew');
  const team=$('cmdTeam');
  if(newRequest){
    const allowed=isAdmin||isRequester;
    newRequest.style.display=allowed?'':'none';
    newRequest.setAttribute('aria-disabled',allowed?'false':'true');
  }
  if(team){
    const allowed=isAdmin||isExecutor;
    team.style.display=allowed?'':'none';
    team.setAttribute('aria-disabled',allowed?'false':'true');
  }
}
document.addEventListener('click',event=>{
  const profile=session()?.profile||'';
  if(event.target.closest('#cmdNew')&&profile==='transporte'){
    event.preventDefault();event.stopImmediatePropagation();
    alert('O perfil executante não pode criar solicitações de transporte.');
  }
  if(event.target.closest('#cmdTeam')&&profile==='solicitante'){
    event.preventDefault();event.stopImmediatePropagation();
    alert('O perfil solicitante não pode acessar Transportes da equipe.');
  }
},true);
const observer=new MutationObserver(applyPermissions);
observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.addEventListener('pageshow',applyPermissions);
document.addEventListener('submit',()=>setTimeout(applyPermissions,60),true);
applyPermissions();
})();

/* Correção do calendário da data de nascimento no iPhone: o toque atinge diretamente o input nativo. */
(()=>{
'use strict';
function applyCalendarFix(){
  const native=document.getElementById('birthDateNative');
  const button=document.querySelector('.birth-date-calendar');
  const wrap=document.querySelector('.birth-date-control');
  if(!native||!button||!wrap)return;
  wrap.style.position='relative';
  wrap.style.overflow='visible';
  button.style.pointerEvents='none';
  button.style.zIndex='2';
  Object.assign(native.style,{
    position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',
    width:'44px',height:'44px',margin:'0',padding:'0',opacity:'0.001',
    pointerEvents:'auto',zIndex:'3',cursor:'pointer',border:'0',background:'transparent'
  });
  native.removeAttribute('tabindex');
  native.setAttribute('aria-label','Selecionar data de nascimento no calendário');
}
function ready(){applyCalendarFix();setTimeout(applyCalendarFix,100);setTimeout(applyCalendarFix,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
new MutationObserver(applyCalendarFix).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('pageshow',ready);
})();