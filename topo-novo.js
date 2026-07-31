(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const readRequests=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
  const readUsers=()=>{try{return JSON.parse(localStorage.getItem('heuroUsers')||'[]')}catch{return[]}};
  const normalize=value=>String(value||'').trim().toLowerCase();
  const isDone=item=>['concluído','concluido','cancelado'].includes(normalize(item.status));

  function ensureBadge(){
    const frame=document.querySelector('#commandNew .command-frame');
    if(!frame)return null;
    let badge=$('topNotificationBadge');
    if(!badge){
      badge=document.createElement('span');
      badge.id='topNotificationBadge';
      badge.setAttribute('aria-hidden','true');
      badge.style.cssText='position:absolute;z-index:8;left:70.7%;top:2.5%;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#d52b2b;color:#fff;font:700 11px/18px Arial,sans-serif;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.25);pointer-events:none;display:none';
      frame.appendChild(badge);
    }
    return badge;
  }

  function updateBadge(){
    const badge=ensureBadge();
    if(!badge)return;
    const pendingRequests=readRequests().filter(item=>!isDone(item)).length;
    const pendingUsers=readUsers().filter(user=>normalize(user.status)==='aguardando').length;
    const total=pendingRequests+pendingUsers;
    badge.textContent=total>99?'99+':String(total);
    badge.style.display=total>0?'block':'none';
  }

  document.addEventListener('click',event=>{
    const logout=event.target.closest('#cmdLogout');
    if(!logout)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const confirmed=window.confirm('Deseja sair do aplicativo Transporte HEURO?');
    if(!confirmed)return;
    sessionStorage.removeItem('heuroSession');
    document.querySelectorAll('.screen').forEach(screen=>screen.classList.remove('active'));
    $('welcomeNew')?.classList.add('active');
    window.scrollTo(0,0);
  },true);

  document.addEventListener('click',event=>{
    if(event.target.closest('#cmdBell'))setTimeout(updateBadge,100);
  },true);

  window.addEventListener('storage',updateBadge);
  document.addEventListener('submit',()=>setTimeout(updateBadge,150),true);
  document.addEventListener('DOMContentLoaded',updateBadge,{once:true});
  updateBadge();
})();