(()=>{
'use strict';

const HOTSPOT_ID='solicitadosBottomHotspot';

function openRequestedReadOnly(){
  const pendingButton=document.getElementById('cmdPending');
  if(pendingButton){
    pendingButton.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    return;
  }
  document.dispatchEvent(new CustomEvent('heuro:open-pending-sheet',{
    detail:{requestId:'',source:'solicitados',readOnly:true,allowStatusChange:false}
  }));
}

function installHotspot(){
  const frame=document.querySelector('.command-image-frame');
  if(!frame||document.getElementById(HOTSPOT_ID))return;
  const button=document.createElement('button');
  button.id=HOTSPOT_ID;
  button.type='button';
  button.setAttribute('aria-label','Abrir planilha dos solicitados');
  button.style.cssText='position:absolute;left:20%;bottom:0;width:22%;height:8.5%;z-index:80;margin:0;padding:0;border:0;background:transparent;appearance:none;-webkit-appearance:none;touch-action:manipulation;cursor:pointer;';
  button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    openRequestedReadOnly();
  });
  frame.appendChild(button);
}

window.addEventListener('click',event=>{
  const target=event.target.closest('#cmdTransport,#transportNavCard,[aria-label*="Solicitados" i],[title*="Solicitados" i]');
  if(!target)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openRequestedReadOnly();
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installHotspot,{once:true});
else installHotspot();
new MutationObserver(installHotspot).observe(document.documentElement,{subtree:true,childList:true});
})();