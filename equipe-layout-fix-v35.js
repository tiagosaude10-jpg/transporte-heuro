(()=>{
'use strict';
const STYLE_ID='heuro-equipe-layout-v35';
function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
html,body{max-width:100%!important;overflow-x:hidden!important}
#teamNew.active{position:fixed!important;inset:0!important;width:100vw!important;max-width:100vw!important;overflow-x:hidden!important;overflow-y:auto!important;background:#f4f7fb!important;-webkit-overflow-scrolling:touch!important;padding:0!important}
#teamNew>.page-wrap{width:100%!important;max-width:720px!important;min-width:0!important;margin:0 auto!important;padding-top:calc(env(safe-area-inset-top, 0px) + 54px)!important;padding-left:14px!important;padding-right:14px!important;padding-bottom:calc(env(safe-area-inset-bottom, 0px) + 36px)!important;overflow-x:hidden!important}
#teamNew .page-head{position:relative!important;z-index:5!important;width:100%!important;max-width:100%!important;min-width:0!important}
#teamListNew{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important}
#teamListNew>section,#teamListNew>div{max-width:100%!important;min-width:0!important}
#teamListNew div[style*="overflow-x:auto"],#teamListNew div[style*="overflow-x: auto"],#teamListNew div[style*="overflow-x:scroll"],#teamListNew div[style*="overflow-x: scroll"]{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important;touch-action:pan-x pan-y!important}
#teamListNew table{max-width:none!important;margin:0!important;border-collapse:separate!important;border-spacing:0!important}
#teamListNew thead th{position:sticky!important;top:0!important;z-index:4!important;background:#eef5fc!important;text-align:center!important}
#teamListNew tbody tr:not(:last-child)>td{border-bottom:1px solid #9dc5ea!important}
#teamListNew tbody td{background:#fff}
#teamListNew section+section{margin-top:24px!important}
@media(max-width:640px){#teamNew>.page-wrap{max-width:100vw!important}}
`;
  document.head.appendChild(style);
}
function goToTeamMenu(){
  const commandButton=document.getElementById('cmdTeam');
  if(commandButton){
    commandButton.click();
    setTimeout(()=>window.scrollTo(0,0),80);
  }
}
function bindLayout(){
  installStyles();
  const team=document.getElementById('teamNew');
  if(team?.classList.contains('active'))team.scrollLeft=0;
}
new MutationObserver(bindLayout).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',event=>{
  const internalBack=event.target.closest('#backAcceptedMenu,#backTeamMenu');
  if(!internalBack)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  goToTeamMenu();
},true);
window.addEventListener('pageshow',bindLayout);
bindLayout();
})();