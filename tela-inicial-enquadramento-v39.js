(()=>{
'use strict';
const STYLE_ID='heuro-welcome-fit-v41';
function install(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
body.welcome-fit-active{margin:0!important;padding:0!important;width:100vw!important;height:100dvh!important;overflow:hidden!important;background:#fff!important}
body.welcome-fit-active main{margin:0!important;padding:0!important;width:100vw!important;height:100dvh!important;overflow:hidden!important}
#welcomeNew.active{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important;z-index:9998!important}
#welcomeNew.active .welcome-frame{position:absolute!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important;transform:none!important}
#welcomeNew.active .welcome-image{display:block!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;object-fit:contain!important;object-position:center!important;transform:none!important}
`;
  document.head.appendChild(style);
}
function safeInsetTop(){
  const probe=document.createElement('div');
  probe.style.cssText='position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top, 0px)';
  document.body.appendChild(probe);
  const value=parseFloat(getComputedStyle(probe).paddingTop)||0;
  probe.remove();
  return value;
}
function sync(){
  install();
  const welcome=document.getElementById('welcomeNew');
  const active=!!welcome?.classList.contains('active');
  document.body.classList.toggle('welcome-fit-active',active);
  if(!active)return;
  const frame=welcome.querySelector('.welcome-frame');
  const image=welcome.querySelector('.welcome-image');
  if(!frame||!image)return;
  const viewportW=Math.round(window.visualViewport?.width||window.innerWidth||document.documentElement.clientWidth);
  const viewportH=Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight);
  const topInset=Math.max(24,Math.round(safeInsetTop()));
  const bottomInset=Math.max(8,Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom'))||0));
  const availableH=Math.max(1,viewportH-topInset-bottomInset);
  const naturalW=image.naturalWidth||viewportW;
  const naturalH=image.naturalHeight||availableH;
  const scale=Math.min(viewportW/naturalW,availableH/naturalH);
  const renderW=Math.round(naturalW*scale);
  const renderH=Math.round(naturalH*scale);
  const left=Math.round((viewportW-renderW)/2);
  const top=Math.round(topInset+(availableH-renderH)/2);
  welcome.style.setProperty('width',`${viewportW}px`,'important');
  welcome.style.setProperty('height',`${viewportH}px`,'important');
  frame.style.setProperty('left',`${left}px`,'important');
  frame.style.setProperty('top',`${top}px`,'important');
  frame.style.setProperty('width',`${renderW}px`,'important');
  frame.style.setProperty('height',`${renderH}px`,'important');
  image.style.setProperty('width','100%','important');
  image.style.setProperty('height','100%','important');
  window.scrollTo(0,0);
}
function ready(){
  const image=document.querySelector('#welcomeNew .welcome-image');
  if(image&&!image.complete)image.addEventListener('load',sync,{once:true});
  sync();
}
new MutationObserver(ready).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.visualViewport?.addEventListener('resize',sync);
window.addEventListener('resize',sync);
window.addEventListener('orientationchange',()=>setTimeout(sync,120));
window.addEventListener('pageshow',ready);
ready();
})();