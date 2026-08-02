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

/* Calendário da data de nascimento: toque nativo + botão X para limpar. */
(()=>{
'use strict';
function fix(){
  const control=document.querySelector('.birth-date-control');
  const native=document.getElementById('birthDateNative');
  const display=document.getElementById('birthDateNew');
  const calendar=document.querySelector('.birth-date-calendar');
  if(!control||!native||!display||!calendar)return false;

  control.style.position='relative';
  control.style.overflow='visible';
  display.style.paddingRight='104px';

  calendar.style.right='8px';
  calendar.style.pointerEvents='none';
  calendar.style.zIndex='2';

  native.style.setProperty('position','absolute','important');
  native.style.setProperty('right','4px','important');
  native.style.setProperty('top','50%','important');
  native.style.setProperty('transform','translateY(-50%)','important');
  native.style.setProperty('width','48px','important');
  native.style.setProperty('height','48px','important');
  native.style.setProperty('margin','0','important');
  native.style.setProperty('padding','0','important');
  native.style.setProperty('opacity','0.01','important');
  native.style.setProperty('display','block','important');
  native.style.setProperty('visibility','visible','important');
  native.style.setProperty('pointer-events','auto','important');
  native.style.setProperty('z-index','5','important');
  native.style.setProperty('border','0','important');
  native.style.setProperty('background','transparent','important');
  native.removeAttribute('tabindex');
  native.setAttribute('aria-label','Selecionar data de nascimento no calendário');

  if(!control.querySelector('.birth-date-clear')){
    const clear=document.createElement('button');
    clear.type='button';
    clear.className='birth-date-clear';
    clear.setAttribute('aria-label','Apagar data de nascimento');
    clear.textContent='×';
    clear.style.cssText='position:absolute;right:52px;top:50%;transform:translateY(-50%);width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:#65758b;font-size:30px;line-height:36px;padding:0;display:flex;align-items:center;justify-content:center;z-index:7;';
    clear.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      display.value='';
      native.value='';
      display.setCustomValidity('');
      display.focus();
    });
    control.appendChild(clear);
  }

  if(native.dataset.syncBound!=='1'){
    native.dataset.syncBound='1';
    native.addEventListener('change',()=>{
      if(!native.value){display.value='';return;}
      const [year,month,day]=native.value.split('-');
      display.value=`${day}/${month}/${year}`;
      display.setCustomValidity('');
    });
  }
  return true;
}
function start(){
  let tries=0;
  const run=()=>{
    tries+=1;
    if(fix()||tries>50)clearInterval(timer);
  };
  run();
  const timer=setInterval(run,100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
new MutationObserver(fix).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('pageshow',start);
})();