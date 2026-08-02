(()=>{
'use strict';
const STYLE_ID='heuro-welcome-fit-v40';
function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
body.heuro-welcome-active{
  margin:0!important;
  padding:0!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:100dvh!important;
  overflow:hidden!important;
  background:#fff!important;
}
body.heuro-welcome-active main{
  margin:0!important;
  padding:0!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:100dvh!important;
  overflow:hidden!important;
}
#welcomeNew.active{
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  background:#fff!important;
  z-index:9999!important;
}
#welcomeNew.active .welcome-frame{
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  background:#fff!important;
}
#welcomeNew.active .welcome-image{
  position:absolute!important;
  inset:0!important;
  display:block!important;
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  object-fit:fill!important;
  object-position:center!important;
}
`;
  document.head.appendChild(style);
}
function sync(){
  installStyles();
  const welcome=document.getElementById('welcomeNew');
  const active=!!welcome?.classList.contains('active');
  document.body.classList.toggle('heuro-welcome-active',active);
  if(!active)return;
  const viewport=window.visualViewport;
  const width=Math.round(viewport?.width||window.innerWidth||document.documentElement.clientWidth);
  const height=Math.round(viewport?.height||window.innerHeight||document.documentElement.clientHeight);
  welcome.style.setProperty('width',`${width}px`,'important');
  welcome.style.setProperty('height',`${height}px`,'important');
  welcome.style.setProperty('top','0px','important');
  welcome.style.setProperty('left','0px','important');
  window.scrollTo(0,0);
}
new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.visualViewport?.addEventListener('resize',sync);
window.addEventListener('resize',sync);
window.addEventListener('pageshow',sync);
sync();
})();