(()=>{
'use strict';
const STYLE_ID='heuro-welcome-fit-v39';
function install(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
body.welcome-fit-active{
  margin:0!important;
  padding:0!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:100dvh!important;
  overflow:hidden!important;
  background:#fff!important;
}
body.welcome-fit-active main{
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
  z-index:9998!important;
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
  object-position:center center!important;
}
`;
  document.head.appendChild(style);
}
function sync(){
  install();
  const welcome=document.getElementById('welcomeNew');
  const active=!!welcome?.classList.contains('active');
  document.body.classList.toggle('welcome-fit-active',active);
  if(!active)return;
  const w=Math.round(window.visualViewport?.width||window.innerWidth||document.documentElement.clientWidth);
  const h=Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight);
  welcome.style.setProperty('width',`${w}px`,'important');
  welcome.style.setProperty('height',`${h}px`,'important');
  welcome.style.setProperty('top','0px','important');
  welcome.style.setProperty('left','0px','important');
  const frame=welcome.querySelector('.welcome-frame');
  const image=welcome.querySelector('.welcome-image');
  if(frame){
    frame.style.setProperty('width',`${w}px`,'important');
    frame.style.setProperty('height',`${h}px`,'important');
  }
  if(image){
    image.style.setProperty('width',`${w}px`,'important');
    image.style.setProperty('height',`${h}px`,'important');
  }
  window.scrollTo(0,0);
}
new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.visualViewport?.addEventListener('resize',sync);
window.addEventListener('resize',sync);
window.addEventListener('orientationchange',()=>setTimeout(sync,120));
window.addEventListener('pageshow',sync);
sync();
})();