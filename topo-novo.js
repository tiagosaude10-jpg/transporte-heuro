(()=>{
  'use strict';

  document.title='Transporte HEURO';
  const addHeadLink=(rel,href,extra={})=>{
    let link=document.head.querySelector(`link[rel="${rel}"]`);
    if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link);}
    link.href=href;
    Object.entries(extra).forEach(([key,value])=>link.setAttribute(key,value));
  };
  const addMeta=(name,content)=>{
    let meta=document.head.querySelector(`meta[name="${name}"]`);
    if(!meta){meta=document.createElement('meta');meta.name=name;document.head.appendChild(meta);}
    meta.content=content;
  };
  addHeadLink('manifest','manifest-novo.json?v=1');
  addHeadLink('apple-touch-icon','AC1F8155-6FA3-4763-B069-50086DF91DD6.png?v=1',{sizes:'1024x1024'});
  addMeta('apple-mobile-web-app-capable','yes');
  addMeta('apple-mobile-web-app-status-bar-style','black-translucent');
  addMeta('apple-mobile-web-app-title','HEURO Transporte');
  addMeta('mobile-web-app-capable','yes');

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