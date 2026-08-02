(()=>{
'use strict';
const STYLE_ID='heuro-command-fit-v43';
function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
body.command-fit-active{margin:0!important;padding:0!important;width:100vw!important;height:100dvh!important;overflow:hidden!important;background:#fff!important}
body.command-fit-active main{margin:0!important;padding:0!important;width:100vw!important;height:100dvh!important;overflow:hidden!important;background:#fff!important}
#commandNew.active{position:fixed!important;inset:0!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100vw!important;height:100dvh!important;min-height:0!important;margin:0!important;padding:max(env(safe-area-inset-top),52px) 0 max(env(safe-area-inset-bottom),8px)!important;overflow:hidden!important;background:#fff!important;z-index:9999!important;transform:none!important}
#commandNew.active .command-frame{position:relative!important;display:inline-block!important;width:auto!important;height:auto!important;max-width:100vw!important;max-height:calc(100dvh - max(env(safe-area-inset-top),52px) - max(env(safe-area-inset-bottom),8px))!important;margin:0!important;padding:0!important;line-height:0!important;overflow:hidden!important;background:#fff!important;transform:none!important}
#commandNew.active .command-image{position:static!important;display:block!important;width:auto!important;height:auto!important;max-width:100vw!important;max-height:calc(100dvh - max(env(safe-area-inset-top),52px) - max(env(safe-area-inset-bottom),8px))!important;margin:0 auto!important;padding:0!important;object-fit:contain!important;object-position:center!important;transform:none!important}
`;
  document.head.appendChild(style);
}
function sync(){
  installStyles();
  const command=document.getElementById('commandNew');
  const active=!!command?.classList.contains('active');
  document.body.classList.toggle('command-fit-active',active);
  if(!active)return;
  const image=command.querySelector('.command-image');
  if(image&&!image.complete){image.addEventListener('load',sync,{once:true});return;}
  window.scrollTo(0,0);
}
new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.visualViewport?.addEventListener('resize',sync);
window.addEventListener('resize',sync);
window.addEventListener('orientationchange',()=>setTimeout(sync,120));
window.addEventListener('pageshow',sync);
sync();
})();