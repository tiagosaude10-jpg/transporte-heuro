(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const readRequests=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
  const readUsers=()=>{try{return JSON.parse(localStorage.getItem('heuroUsers')||'[]')}catch{return[]}};
  const currentSession=()=>{try{return JSON.parse(sessionStorage.getItem('heuroSession')||'null')}catch{return null}};
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const formatDate=value=>{if(!value)return 'Não informado';const [y,m,d]=value.split('-');return y&&m&&d?`${d}/${m}/${y}`:value};
  const normalize=value=>String(value||'').trim().toLowerCase();
  const isDone=item=>['concluído','concluido','cancelado'].includes(normalize(item.status));
  const isAccepted=item=>normalize(item.status)==='aceito';
  const show=id=>{document.querySelectorAll('.screen').forEach(screen=>screen.classList.remove('active'));$(id)?.classList.add('active');window.scrollTo(0,0)};

  function injectStyles(){
    if($('quickActionsStyles'))return;
    const style=document.createElement('style');
    style.id='quickActionsStyles';
    style.textContent=`
      .quick-page{max-width:760px;margin:0 auto;padding:20px 14px 36px}
      .quick-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
      .quick-head span{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#0b5fa5}
      .quick-head h2{margin:4px 0 0}
      .quick-back{border:0;border-radius:11px;padding:10px 14px;background:#e8eef7;color:#13213a;font-weight:700}
      .quick-list{display:grid;gap:12px}
      .quick-card{width:100%;text-align:left;border:1px solid #dce4ef;border-radius:17px;padding:16px;box-shadow:0 8px 22px rgba(20,40,80,.12);box-sizing:border-box;transition:transform .12s ease,box-shadow .12s ease}
      button.quick-card{appearance:none;font:inherit;cursor:pointer}
      .quick-card:active{transform:scale(.986);box-shadow:0 4px 12px rgba(20,40,80,.16)}
      .quick-card.pending{background:linear-gradient(145deg,#ff9f0a,#ef7900);border-color:#db6d00}
      .quick-card.accepted{background:linear-gradient(145deg,#25a85d,#128044);border-color:#0b6f39}
      .quick-card.done{background:linear-gradient(145deg,#7752a0,#5b3f82);border-color:#513575}
      .quick-card strong{display:block;font-size:17px;margin:8px 0 5px;color:#fff}
      .quick-card small,.quick-card span{display:block;color:rgba(255,255,255,.94);line-height:1.45}
      .quick-status{display:inline-block!important;width:auto;padding:6px 10px;border-radius:999px;background:#c85d00;color:#fff!important;font-weight:900;font-size:12px;box-shadow:0 3px 8px rgba(102,44,0,.22)}
      .quick-status.accepted{background:#076b35;color:#fff!important;box-shadow:0 3px 8px rgba(0,70,33,.24)}
      .quick-status.done{background:#49306b;color:#fff!important}
      .quick-person{margin-top:6px;font-size:13px;color:rgba(255,255,255,.96)!important}
      .quick-person b{color:#fff}
      .pending-sheet-button{width:100%;border:0;border-radius:14px;padding:14px 16px;background:linear-gradient(135deg,#0b6fc1,#084f9b);color:#fff;font-weight:900;font-size:15px;box-shadow:0 8px 18px rgba(8,79,155,.20);margin-bottom:4px}
      .quick-empty{background:#fff;border-radius:17px;padding:22px;text-align:center;color:#657389;border:1px solid #dce4ef}
      .profile-card,.more-card{background:#fff;border:1px solid #dce4ef;border-radius:18px;padding:20px;box-shadow:0 8px 22px rgba(20,40,80,.08)}
      .profile-card p{margin:8px 0;color:#5f6d82}.profile-card b{color:#13213a}
      .more-grid{display:grid;gap:12px}.more-action{width:100%;border:0;border-radius:14px;padding:15px;text-align:left;background:#eef5fb;color:#0b5fa5;font-weight:800}
      .notice{background:#fff;border-left:5px solid #0b5fa5;border-radius:14px;padding:15px;box-shadow:0 7px 18px rgba(20,40,80,.07)}
      .notice strong{display:block;margin-bottom:5px}.notice small{color:#66758a}
      #pendingNew.active{position:fixed;inset:0;overflow:hidden;background:#f5f8fc;padding-top:env(safe-area-inset-top,0px)}
      #pendingNew.active .quick-page{height:100%;max-width:760px;margin:0 auto;padding:18px 14px 0;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box}
      #pendingNew.active .quick-head{flex:0 0 auto;margin:0 -14px;padding:0 14px 16px;background:#fff;border-bottom:1px solid #edf1f6;box-shadow:0 6px 14px rgba(20,40,80,.06);z-index:5}
      #pendingNew.active .quick-list{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 0 36px;overscroll-behavior:contain}
    `;
    document.head.appendChild(style);
  }

  function ensureScreen(id,title,eyebrow){
    let screen=$(id);
    if(screen)return screen;
    screen=document.createElement('section');
    screen.id=id;
    screen.className='screen';
    screen.innerHTML=`<div class="quick-page"><div class="quick-head"><div><span>${esc(eyebrow)}</span><h2>${esc(title)}</h2></div><button class="quick-back" type="button">Voltar</button></div><div class="quick-list"></div></div>`;
    document.querySelector('main')?.appendChild(screen);
    screen.querySelector('.quick-back')?.addEventListener('click',()=>show('commandNew'));
    return screen;
  }

  function openPendingSheet(requestId=''){
    document.dispatchEvent(new CustomEvent('heuro:open-pending-sheet',{detail:{requestId:String(requestId||'')}}));
  }

  function card(item,clickable=false){
    const location=item.boxNumber?`Box ${esc(item.boxNumber)}`:`Enfermaria ${esc(item.ward||'não informada')} · Leito ${esc(item.bed||'não informado')}`;
    const accepted=isAccepted(item);
    const status=accepted?'Aceito / Em andamento':(item.status||'Solicitado');
    const statusClass=isDone(item)?'done':(accepted?'accepted':'');
    const cardClass=isDone(item)?'done':(accepted?'accepted':'pending');
    const tag=clickable?'button':'article';
    const attrs=clickable?`type="button" data-open-pending-sheet="1" data-request-id="${esc(item.id)}"`:'';
    return `<${tag} class="quick-card ${cardClass}" ${attrs}><span class="quick-status ${statusClass}">${esc(status)}</span><strong>${esc(item.patient||'Paciente não informado')}</strong><small>${esc(item.protocol||'Sem protocolo')}</small><span>${esc(item.originSector||'Origem não informada')} · ${location}</span><span>Destino: ${esc(item.destination||'Não informado')}</span><span>Horário agendado: ${formatDate(item.transportDate)} às ${esc(item.transportTime||'--:--')}</span><span class="quick-person"><b>Solicitado por:</b> ${esc(item.requester||'Não informado')}</span><span class="quick-person"><b>Aceito por:</b> ${esc(item.executor||'—')}</span></${tag}>`;
  }

  function render(screenId,title,eyebrow,filter,sorter,emptyText,options={}){
    injectStyles();
    const screen=ensureScreen(screenId,title,eyebrow);
    const list=screen.querySelector('.quick-list');
    let data=readRequests().filter(filter);
    if(sorter)data=data.sort(sorter);
    const top=options.pending?'<button class="pending-sheet-button" data-open-pending-sheet="1" type="button">Visualizar planilha geral de pendências</button>':'';
    list.innerHTML=top+(data.length?data.map(item=>card(item,Boolean(options.pending))).join(''):`<div class="quick-empty">${esc(emptyText)}</div>`);
    list.scrollTop=0;
    show(screenId);
  }

  function bind(id,handler){
    document.addEventListener('click',event=>{
      const target=event.target.closest(`#${id}`);
      if(!target)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      handler();
    },true);
  }

  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-open-pending-sheet="1"]');
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openPendingSheet(target.dataset.requestId||'');
  },true);

  bind('cmdPending',()=>render('pendingNew','Solicitações pendentes','Ações rápidas',item=>!isDone(item),(a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0),'Nenhuma solicitação pendente no momento.',{pending:true}));
  bind('cmdAgenda',()=>render('agendaNew','Agenda de transportes','Programação',item=>!isDone(item)&&Boolean(item.transportDate),(a,b)=>`${a.transportDate||''}T${a.transportTime||''}`.localeCompare(`${b.transportDate||''}T${b.transportTime||''}`),'Nenhum transporte programado na agenda.'));
  bind('cmdHistory',()=>render('historyNew','Histórico de transportes','Consultas',item=>isDone(item),(a,b)=>new Date(b.completedAt||b.createdAt||0)-new Date(a.completedAt||a.createdAt||0),'Nenhum transporte concluído no histórico.'));
  bind('cmdHome',()=>show('commandNew'));
  bind('cmdTransport',()=>render('allTransportsNew','Todos os transportes','Barra inferior',()=>true,(a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0),'Nenhum transporte cadastrado.'));

  function openNotifications(){
    injectStyles();
    const screen=ensureScreen('notificationsNew','Notificações','Barra inferior');
    const list=screen.querySelector('.quick-list');
    const pendingRequests=readRequests().filter(item=>!isDone(item));
    const pendingUsers=readUsers().filter(user=>normalize(user.status)==='aguardando');
    const notices=[];
    if(pendingRequests.length)notices.push(`<div class="notice"><strong>${pendingRequests.length} solicitação(ões) pendente(s)</strong><small>Existem transportes aguardando execução ou conclusão.</small></div>`);
    if(pendingUsers.length)notices.push(`<div class="notice"><strong>${pendingUsers.length} cadastro(s) aguardando aprovação</strong><small>Aprovação disponível para administradores.</small></div>`);
    list.innerHTML=notices.length?notices.join(''):'<div class="quick-empty">Nenhuma notificação no momento.</div>';
    show('notificationsNew');
  }
  bind('cmdNotifications',openNotifications);
  bind('cmdBell',openNotifications);

  bind('cmdProfile',()=>{
    injectStyles();
    const screen=ensureScreen('profileNew','Meu perfil','Barra inferior');
    const list=screen.querySelector('.quick-list');
    const active=currentSession();
    const user=readUsers().find(item=>item.id===active?.id)||active;
    const labels={solicitante:'Solicitante de transporte',transporte:'Executante de transporte',administrador:'Administrador'};
    list.innerHTML=user?`<div class="profile-card"><p><b>Nome:</b> ${esc(user.fullName||user.name||user.username)}</p><p><b>Usuário:</b> ${esc(user.username||'Não informado')}</p><p><b>Perfil:</b> ${esc(labels[user.profile]||user.profile||'Não informado')}</p><p><b>Status:</b> ${esc(user.status||'Ativo')}</p>${user.email?`<p><b>E-mail:</b> ${esc(user.email)}</p>`:''}${user.phone?`<p><b>Telefone:</b> ${esc(user.phone)}</p>`:''}</div>`:'<div class="quick-empty">Nenhum usuário conectado.</div>';
    show('profileNew');
  });

  bind('cmdMore',()=>{
    injectStyles();
    const screen=ensureScreen('moreNew','Mais opções','Barra inferior');
    const list=screen.querySelector('.quick-list');
    const active=currentSession();
    if(active?.profile!=='administrador'){
      list.innerHTML='<div class="quick-empty">Esta área é exclusiva para administradores.</div>';
    }else{
      const pendingUsers=readUsers().filter(user=>normalize(user.status)==='aguardando').length;
      list.innerHTML=`<div class="more-card"><div class="more-grid"><button class="more-action" type="button" id="moreApproveUsers">Aprovar cadastros (${pendingUsers})</button><button class="more-action" type="button" id="moreWhatsapp">Configurar WhatsApp da empresa</button><button class="more-action" type="button" id="moreSystem">Configurações do sistema</button></div></div>`;
      list.querySelector('#moreApproveUsers')?.addEventListener('click',()=>alert('A tela de aprovação de cadastros será conectada na próxima etapa.'));
      list.querySelector('#moreWhatsapp')?.addEventListener('click',()=>alert('A configuração do WhatsApp será conectada na próxima etapa.'));
      list.querySelector('#moreSystem')?.addEventListener('click',()=>alert('As configurações administrativas serão conectadas na próxima etapa.'));
    }
    show('moreNew');
  });
})();