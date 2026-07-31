(()=>{
  'use strict';
  const readSession=()=>{try{return JSON.parse(sessionStorage.getItem('heuroSession')||'null')}catch{return null}};
  const readUsers=()=>{try{return JSON.parse(localStorage.getItem('heuroUsers')||'[]')}catch{return[]}};

  function getLoggedName(){
    const active=readSession();
    if(!active)return '';
    const user=readUsers().find(item=>String(item.id)===String(active.id));
    return String(user?.fullName||active.name||user?.username||active.username||'').trim();
  }

  function ensureGreeting(){
    const frame=document.querySelector('#commandNew .command-frame');
    if(!frame)return null;
    let name=document.getElementById('commandUserName');
    if(!name){
      name=document.createElement('div');
      name.id='commandUserName';
      name.setAttribute('aria-live','polite');
      name.style.cssText='position:absolute;z-index:7;left:5.2%;top:13.1%;width:54%;color:#fff;font-family:Arial,sans-serif;font-weight:700;font-size:clamp(18px,4.2vw,38px);line-height:1.08;text-align:left;white-space:normal;overflow-wrap:anywhere;text-shadow:0 1px 2px rgba(0,0,0,.18);pointer-events:none';
      frame.appendChild(name);
    }
    return name;
  }

  function updateGreeting(){
    const element=ensureGreeting();
    if(!element)return;
    element.textContent=getLoggedName();
    element.style.display=element.textContent?'block':'none';
  }

  document.addEventListener('submit',()=>setTimeout(updateGreeting,80),true);
  document.addEventListener('click',event=>{
    if(event.target.closest('#welcomeEnterNew,#cmdHome,#requestBackNew,#teamBackNew,.quick-back'))setTimeout(updateGreeting,80);
  },true);
  window.addEventListener('storage',updateGreeting);
  document.addEventListener('DOMContentLoaded',updateGreeting,{once:true});
  updateGreeting();
})();
