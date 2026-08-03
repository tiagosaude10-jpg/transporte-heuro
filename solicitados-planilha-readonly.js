(()=>{
'use strict';

function openRequestedSheet(){
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
  const button=event.target.closest('#cmdTransport');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openRequestedSheet();
},true);
})();
