(()=>{
'use strict';
const STYLE_ID='heuro-command-fit-v36';
function install(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#commandNew.active{
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:100dvh!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  background:#fff!important;
  z-index:20!important;
}
#commandNew.active .command-frame{
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
}
#commandNew.active .command-image{
  display:block!important;
  width:100%!important;
  height:100%!important;
  margin:0!important;
  object-fit:fill!important;
}
`;
  document.head.appendChild(style);
}
new MutationObserver(install).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('pageshow',install);
install();
})();