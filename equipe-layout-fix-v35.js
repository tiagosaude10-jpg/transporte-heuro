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
  if(commandButton){commandButton.click();setTimeout(()=>window.scrollTo(0,0),80)}
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
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();goToTeamMenu();
},true);
window.addEventListener('pageshow',bindLayout);
bindLayout();

function loadStatusColors(){
  if(document.getElementById('coresStatusHeuroScript'))return;
  const colors=document.createElement('script');
  colors.id='coresStatusHeuroScript';
  colors.src=`cores-status-heuro.js?v=1-${Date.now()}`;
  colors.async=false;
  document.body.appendChild(colors);
}
function loadPdfFix(){
  if(document.getElementById('planilhaPendenciasPdfClaroScript')){loadStatusColors();return}
  const fix=document.createElement('script');
  fix.id='planilhaPendenciasPdfClaroScript';
  fix.src=`planilha-pendencias-pdf-claro.js?v=1-${Date.now()}`;
  fix.async=false;
  fix.onload=loadStatusColors;
  document.body.appendChild(fix);
}

// Carrega a planilha geral exclusiva das pendências sem reutilizar a planilha antiga da equipe.
if(!document.getElementById('planilhaPendenciasGeralScript')){
  const script=document.createElement('script');
  script.id='planilhaPendenciasGeralScript';
  script.src=`planilha-pendencias-geral.js?v=2-${Date.now()}`;
  script.async=false;
  script.onload=loadPdfFix;
  document.body.appendChild(script);
}else{
  loadPdfFix();
}
})();

// Tela nova aplicada exclusivamente ao loginNew.
(()=>{
'use strict';
const STYLE_ID='heuro-login-exclusivo-v1';
const IMAGE_URL='https://raw.githubusercontent.com/tiagosaude10-jpg/transporte-heuro/f5ebf875b865ab126728eea9b05921184ea98fa6/610B133E-A6BC-4292-86A8-5D5DB885BF47.png';

function installLoginStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#loginNew.active{
  position:fixed!important;
  inset:0!important;
  z-index:9999!important;
  width:100vw!important;
  height:100dvh!important;
  min-height:100dvh!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  display:block!important;
  background:#063b91!important;
}
#loginNew.active>.login-wrap{
  position:relative!important;
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  background-image:url('${IMAGE_URL}')!important;
  background-position:center center!important;
  background-size:100% 100%!important;
  background-repeat:no-repeat!important;
}
#loginNew.active .card{
  position:absolute!important;
  left:8.4%!important;
  top:23.7%!important;
  width:83.2%!important;
  height:56.4%!important;
  box-sizing:border-box!important;
  margin:0!important;
  padding:2.2vh 6.2vw 1.5vh!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
  overflow:hidden!important;
}
#loginNew.active .card:before,
#loginNew.active .login-brand,
#loginNew.active .login-intro small{display:none!important}
#loginNew.active .login-intro{padding:0!important;text-align:center!important}
#loginNew.active .login-intro h1{
  margin:0 0 .45vh!important;
  color:#073c8f!important;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif!important;
  font-size:clamp(30px,7vw,50px)!important;
  line-height:1!important;
  font-weight:900!important;
  letter-spacing:-.04em!important;
}
#loginNew.active .login-intro p{
  margin:0 0 1.6vh!important;
  color:#123b7d!important;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif!important;
  font-size:clamp(13px,3.1vw,21px)!important;
  line-height:1.2!important;
  font-weight:500!important;
}
#loginNew.active #loginFormNew{
  display:grid!important;
  grid-template-columns:1fr!important;
  gap:1.05vh!important;
  margin:0!important;
  padding:0!important;
}
#loginNew.active .login-field{
  display:grid!important;
  gap:.45vh!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
}
#loginNew.active .login-field>span{
  display:flex!important;
  align-items:center!important;
  gap:1.5vw!important;
  width:auto!important;
  padding:0!important;
  background:transparent!important;
  color:#073c8f!important;
  font-size:clamp(14px,3.2vw,22px)!important;
  line-height:1.1!important;
  font-weight:900!important;
}
#loginNew.active .login-field>span:before{content:'♙';font-size:1.12em;font-weight:400!important}
#loginNew.active .login-field:nth-of-type(2)>span:before{content:'▣';font-size:.9em}
#loginNew.active .login-password-wrap{position:relative!important;display:block!important}
#loginNew.active .login-field input{
  display:block!important;
  width:100%!important;
  height:5.8vh!important;
  min-height:43px!important;
  max-height:58px!important;
  box-sizing:border-box!important;
  margin:0!important;
  padding:0 4vw!important;
  border:1.4px solid #aeb7c9!important;
  border-radius:10px!important;
  background:rgba(255,255,255,.98)!important;
  color:#23314a!important;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif!important;
  font-size:clamp(15px,3.4vw,23px)!important;
  font-weight:500!important;
  outline:none!important;
}
#loginNew.active .login-password-wrap input{padding-right:12vw!important}
#loginNew.active .login-field input:focus{border-color:#075bd1!important;box-shadow:0 0 0 3px rgba(7,91,209,.14)!important}
#loginNew.active .login-field input::placeholder{color:#a8adba!important;opacity:1!important}
#loginNew.active .password-toggle{
  position:absolute!important;
  right:1.4vw!important;
  top:50%!important;
  transform:translateY(-50%)!important;
  width:9vw!important;
  height:5vh!important;
  max-width:44px!important;
  max-height:44px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:#929bad!important;
  font-size:clamp(20px,5vw,30px)!important;
  box-shadow:none!important;
}
#loginNew.active #loginFormNew .primary{
  width:100%!important;
  height:5.8vh!important;
  min-height:44px!important;
  max-height:58px!important;
  margin:.15vh 0 0!important;
  padding:0!important;
  border:0!important;
  border-radius:10px!important;
  background:linear-gradient(180deg,#0875e8 0%,#003bc4 100%)!important;
  color:#fff!important;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif!important;
  font-size:clamp(16px,3.5vw,24px)!important;
  font-weight:900!important;
  box-shadow:0 6px 13px rgba(0,58,175,.28)!important;
}
#loginNew.active .login-divider{
  display:flex!important;
  align-items:center!important;
  gap:2.4vw!important;
  color:#153c7d!important;
  font-size:clamp(14px,3vw,20px)!important;
  font-weight:700!important;
  line-height:1!important;
}
#loginNew.active .login-divider:before,
#loginNew.active .login-divider:after{content:'';height:1px;flex:1;background:#c6ccd7}
#loginNew.active #openRegisterNew{
  width:100%!important;
  height:5.2vh!important;
  min-height:40px!important;
  max-height:52px!important;
  margin:0!important;
  padding:0 2vw!important;
  border:1.8px solid #073dcc!important;
  border-radius:9px!important;
  background:#fff!important;
  color:#073c9b!important;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif!important;
  font-size:clamp(14px,3vw,21px)!important;
  font-weight:900!important;
  text-decoration:none!important;
}
#loginNew.active .login-security{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:1.5vw!important;
  margin:0!important;
  color:#12336f!important;
  font-size:clamp(10px,2.25vw,16px)!important;
  line-height:1.12!important;
  font-weight:700!important;
  text-align:left!important;
}
#loginNew.active .login-security:before{
  content:'✓'!important;
  display:grid!important;
  place-items:center!important;
  width:4.8vw!important;
  height:4.8vw!important;
  max-width:30px!important;
  max-height:30px!important;
  flex:0 0 4.8vw!important;
  border-radius:7px!important;
  background:#0874df!important;
  color:#fff!important;
  font-weight:900!important;
}
#loginNew.active .login-security strong,
#loginNew.active .login-security small{display:block!important}
#loginNew.active .login-security small{font-size:.88em!important;font-weight:500!important}
#loginNew.active #loginMessageNew{margin:0!important;min-height:14px!important;text-align:center!important;font-size:11px!important;color:#b42318!important}
@media(max-height:700px){
  #loginNew.active .card{top:22.7%!important;height:58%!important;padding-top:1.2vh!important}
  #loginNew.active .login-intro p{margin-bottom:.8vh!important}
  #loginNew.active #loginFormNew{gap:.65vh!important}
  #loginNew.active .login-security{display:none!important}
}
`;
  document.head.appendChild(style);
}

function prepareLogin(){
  installLoginStyle();
  const root=document.getElementById('loginNew');
  if(!root)return;
  const title=root.querySelector('.login-intro h1');
  const subtitle=root.querySelector('.login-intro p');
  const user=document.getElementById('loginUser');
  const pass=document.getElementById('loginPass');
  const form=document.getElementById('loginFormNew');
  const register=document.getElementById('openRegisterNew');
  const security=root.querySelector('.login-security');
  if(!user||!pass||!form||!register)return;

  if(title)title.textContent='Bem-vindo!';
  if(subtitle)subtitle.textContent='Acesse o sistema de Transporte HEURO';
  const userLabel=user.closest('.login-field')?.querySelector(':scope > span');
  if(userLabel)userLabel.textContent='CPF ou e-mail';
  user.placeholder='Digite seu CPF ou e-mail';
  user.setAttribute('autocomplete','username');
  pass.placeholder='Digite sua senha';

  if(!pass.parentElement?.classList.contains('login-password-wrap')){
    const wrap=document.createElement('div');
    wrap.className='login-password-wrap';
    pass.parentNode.insertBefore(wrap,pass);
    wrap.appendChild(pass);
  }
  if(!document.getElementById('toggleLoginPassword')){
    const toggle=document.createElement('button');
    toggle.id='toggleLoginPassword';
    toggle.className='password-toggle';
    toggle.type='button';
    toggle.textContent='◉';
    toggle.setAttribute('aria-label','Mostrar senha');
    pass.parentElement.appendChild(toggle);
    toggle.addEventListener('click',()=>{
      const hidden=pass.type==='password';
      pass.type=hidden?'text':'password';
      toggle.textContent=hidden?'◎':'◉';
      toggle.setAttribute('aria-label',hidden?'Ocultar senha':'Mostrar senha');
    });
  }
  if(!form.querySelector('.login-divider')){
    const divider=document.createElement('div');
    divider.className='login-divider';
    divider.textContent='ou';
    form.insertBefore(divider,register);
  }
  if(security&&!security.dataset.ready){
    security.dataset.ready='1';
    security.innerHTML='<span><strong>Acesso restrito e seguro.</strong><small>Suas informações estão protegidas.</small></span>';
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepareLogin,{once:true});
else prepareLogin();
new MutationObserver(()=>{
  if(document.getElementById('loginNew')?.classList.contains('active'))prepareLogin();
}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});
})();
