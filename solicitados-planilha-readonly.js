(()=>{
'use strict';

function isRequestedButton(target){
  const clickable=target?.closest?.('button,a,[role="button"],[data-view]');
  if(!clickable)return null;
  if(clickable.id==='cmdTransport'||clickable.id==='cmdRequested'||clickable.id==='cmdSolicitados')return clickable;
  const label=[clickable.textContent,clickable.getAttribute('aria-label'),clickable.getAttribute('title'),clickable.dataset?.view].filter(Boolean).join(' ').trim().toLowerCase();
  return /(^|\s)solicitad[oa]s?(\s|$)/.test(label)?clickable:null;
}

function openRequestedSheet(){
  const detail={requestId:'',source:'solicitados',readOnly:true,allowStatusChange:false};
  document.dispatchEvent(new CustomEvent('heuro:open-pending-sheet',{detail}));
}

window.addEventListener('click',event=>{
  const button=isRequestedButton(event.target);
  if(!button)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  openRequestedSheet();
},true);

document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const button=isRequestedButton(event.target);
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openRequestedSheet();
},true);
})();
