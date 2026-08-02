(()=>{
'use strict';
const STYLE_ID='heuro-command-fit-v38';
function installStyles(){
  let style=document.getElementById(STYLE_ID);
  if(style)return;
  style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
body.command-fit-active{
  padding:0!important;
  margin:0!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:100dvh!important;
  overflow:hidden!important;
}
body.command-fit-active main{
  width:100vw!important;
  height:100dvh!important;
  min-height:100dvh!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
}
#commandNew.active{
  position:fixed!important;
  left:0!important;
  top:0!important;
  right:auto!important;
  bottom:auto!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  background:#fff!important;
  z-index:9999!important;
  transform:none!important;
}
#commandNew.active .command-frame{
  position:absolute!important;
  left:0!important;
  top:0!important;
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  transform:none!important;
}
#commandNew.active .command-image{
  position:absolute!important;
  left:0!important;
  top:0!important;
  display:block!important;
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  object-fit:fill!important;
  object-position:center top!important;
  transform:none!important;
}
`;
  document.head.appendChild(style);
}
function sync(){
  installStyles();
  const command=document.getElementById('commandNew');
  const active=!!command?.classList.contains('active');
  document.body.classList.toggle('command-fit-active',active);
  if(active){
    const h=Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight);
    const w=Math.round(window.visualViewport?.width||window.innerWidth||document.documentElement.clientWidth);
    command.style.setProperty('width',`${w}px`,'important');
    command.style.setProperty('height',`${h}px`,'important');
    command.style.setProperty('top','0px','important');
    command.style.setProperty('left','0px','important');
    const frame=command.querySelector('.command-frame');
    const image=command.querySelector('.command-image');
    if(frame){frame.style.setProperty('width',`${w}px`,'important');frame.style.setProperty('height',`${h}px`,'important')}
    if(image){image.style.setProperty('width',`${w}px`,'important');image.style.setProperty('height',`${h}px`,'important')}
    window.scrollTo(0,0);
  }
}
new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.visualViewport?.addEventListener('resize',sync);
window.addEventListener('resize',sync);
window.addEventListener('orientationchange',()=>setTimeout(sync,120));
window.addEventListener('pageshow',sync);
sync();
})();