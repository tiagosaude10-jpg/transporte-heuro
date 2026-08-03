(()=>{
'use strict';

function openRequestedReadOnly(){
  const pendingButton=document.getElementById('cmdPending')||document.getElementById('v2Pending');
  if(pendingButton){
    pendingButton.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    return;
  }
  document.dispatchEvent(new CustomEvent('heuro:open-pending-sheet',{
    detail:{requestId:'',source:'solicitados',readOnly:true,allowStatusChange:false}
  }));
}

function bindRealButton(){
  const button=document.getElementById('v2Transport');
  if(!button||button.dataset.solicitadosBound==='1')return;
  button.dataset.solicitadosBound='1';
  button.style.pointerEvents='auto';
  button.style.zIndex='100';
  button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    openRequestedReadOnly();
  },true);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindRealButton,{once:true});
else bindRealButton();
new MutationObserver(bindRealButton).observe(document.documentElement,{subtree:true,childList:true});
})();
