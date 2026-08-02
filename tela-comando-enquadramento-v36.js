(()=>{
'use strict';
const STYLE_ID='heuro-command-fit-v37';
function install(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
html.command-screen-active,
body.command-screen-active{
  width:100%!important;
  height:100%!important;
  min-height:100%!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  background:#fff!important;
}
#commandNew.active{
  position:fixed!important;
  top:0!important;
  right:0!important;
  bottom:0!important;
  left:0!important;
  width:100%!important;
  height:100%!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  background:#fff!important;
  z-index:9999!important;
}
#commandNew.active .command-frame{
  position:absolute!important;
  top:0!important;
  right:0!important;
  bottom:0!important;
  left:0!important;
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  line-height:0!important;
}
#commandNew.active .command-image{
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
  const active=document.getElementById('commandNew')?.classList.contains('active');
  document.documentElement.classList.toggle('command-screen-active',!!active);
  document.body.classList.toggle('command-screen-active',!!active);
  if(active){
    window.scrollTo(0,0);
    document.getElementById('commandNew').scrollTop=0;
  }
}
new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.addEventListener('pageshow',sync);
window.addEventListener('resize',sync);
sync();
})();