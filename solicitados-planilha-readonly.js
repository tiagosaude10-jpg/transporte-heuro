(()=>{
'use strict';

function isRequestedButton(element){
  if(!element)return false;
  if(element.closest('#cmdTransport'))return true;
  const button=element.closest('button,[role="button"],a');
  if(!button)return false;
  const label=(button.textContent||button.getAttribute('aria-label')||button.getAttribute('title')||'').trim().toLowerCase();
  return label==='solicitados'||label.includes('solicitados');
}

function openRequestedReadOnly(){
  const pendingButton=document.getElementById('cmdPending');
  if(pendingButton){
    pendingButton.click();
    return;
  }
  document.dispatchEvent(new CustomEvent('heuro:open-pending-sheet',{
    detail:{
      requestId:'',
      source:'solicitados',
      readOnly:true,
      allowStatusChange:false
    }
  }));
}

window.addEventListener('click',event=>{
  if(!isRequestedButton(event.target))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openRequestedReadOnly();
},true);
})();
