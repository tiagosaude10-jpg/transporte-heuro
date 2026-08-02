(()=>{
'use strict';
function applyCalendarFix(){
  const native=document.getElementById('birthDateNative');
  const button=document.querySelector('.birth-date-calendar');
  const wrap=document.querySelector('.birth-date-control');
  if(!native||!button||!wrap)return;

  /* No iPhone, o toque precisa atingir diretamente o input nativo de data. */
  wrap.style.position='relative';
  button.style.pointerEvents='none';
  button.style.zIndex='2';

  native.style.position='absolute';
  native.style.right='8px';
  native.style.top='50%';
  native.style.transform='translateY(-50%)';
  native.style.width='44px';
  native.style.height='44px';
  native.style.margin='0';
  native.style.padding='0';
  native.style.opacity='0.001';
  native.style.pointerEvents='auto';
  native.style.zIndex='3';
  native.style.cursor='pointer';
  native.style.border='0';
  native.style.background='transparent';
  native.removeAttribute('tabindex');
  native.setAttribute('aria-label','Selecionar data de nascimento no calendário');

  /* Evita que regras antigas voltem a esconder o seletor. */
  const style=document.getElementById('birth-calendar-fix-v48')||document.createElement('style');
  style.id='birth-calendar-fix-v48';
  style.textContent=`
    .birth-date-control{position:relative!important;overflow:visible!important}
    .birth-date-calendar{pointer-events:none!important;z-index:2!important}
    #birthDateNative{
      position:absolute!important;
      right:8px!important;
      top:50%!important;
      transform:translateY(-50%)!important;
      width:44px!important;
      height:44px!important;
      opacity:.001!important;
      pointer-events:auto!important;
      z-index:3!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      background:transparent!important;
      -webkit-appearance:none!important;
      appearance:none!important;
    }
  `;
  if(!style.parentNode)document.head.appendChild(style);
}

function ready(){
  applyCalendarFix();
  setTimeout(applyCalendarFix,100);
  setTimeout(applyCalendarFix,500);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);
else ready();
new MutationObserver(applyCalendarFix).observe(document.documentElement,{subtree:true,childList:true});
})();
