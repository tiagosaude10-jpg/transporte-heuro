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