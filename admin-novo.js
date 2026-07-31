(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize=value=>String(value||'').trim().toLowerCase();
  const labels={solicitante:'Solicitante de transporte',transporte:'Executante de transporte',administrador:'Administrador'};
  const statusLabels={aguardando:'Aguardando autorização',ativo:'Ativo',recusado:'Recusado',bloqueado:'Bloqueado',inativo:'Inativo'};
  const readUsers=()=>{try{return JSON.parse(localStorage.getItem('heuroUsers')||'[]')}catch{return[]}};
  const saveUsers=data=>localStorage.setItem('heuroUsers',JSON.stringify(data));
  const session=()=>{try{return JSON.parse(sessionStorage.getItem('heuroSession')||'null')}catch{return null}};
  const show=id=>{document.querySelectorAll('.screen').forEach(screen=>screen.classList.remove('active'));$(id)?.classList.add('active');window.scrollTo(0,0)};
  const formatCpf=value=>{const v=String(value||'').replace(/\D/g,'');return v.length===11?v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'):'Não informado'};

  function injectStyles(){
    if($('adminNewStyles'))return;
    const style=document.createElement('style');style.id='adminNewStyles';style.textContent=`
      .admin-page{max-width:760px;margin:0 auto;padding:20px 14px 42px}
      .admin-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:16px}
      .admin-head span{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#0b5fa5}.admin-head h2{margin:4px 0 0}
      .admin-back{border:0;border-radius:11px;padding:10px 14px;background:#e8eef7;color:#13213a;font-weight:700}
      .admin-list{display:grid;gap:14px}.admin-card{background:#fff;border:1px solid #dce4ef;border-radius:18px;padding:18px;box-shadow:0 8px 22px rgba(20,40,80,.08)}
      .admin-card h3{margin:10px 0 5px}.admin-card small{color:#657389}.admin-data{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.admin-data span{background:#f5f8fc;border-radius:12px;padding:10px;color:#4f5f76}.admin-data b{display:block;color:#13213a;margin-bottom:3px}
      .admin-card select,.admin-card input{width:100%;padding:12px;border:1px solid #ccd5e2;border-radius:12px;background:#fff}.admin-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:14px}.admin-actions button{border:0;border-radius:11px;padding:11px 14px;font-weight:800}.admin-approve{background:#dff6e8;color:#08743a}.admin-reject{background:#ffe5e5;color:#a51f1f}.admin-block{background:#eef2f7;color:#37465d}.admin-save{width:100%;background:#0b5fa5;color:#fff}.admin-status{display:inline-flex;padding:6px 9px;border-radius:999px;background:#fff0d9;color:#a65a00;font-size:12px;font-weight:800}.admin-status.ativo{background:#dcf7e8;color:#08743a}.admin-status.recusado,.admin-status.bloqueado{background:#ffe4e4;color:#a51f1f}.admin-empty{text-align:center;padding:24px;background:#fff;border:1px solid #dce4ef;border-radius:18px;color:#657389}.admin-help{color:#657389;line-height:1.45;margin:8px 0 14px}.admin-message{min-height:22px;margin-top:10px;font-weight:700;color:#08743a}
      @media(max-width:600px){.admin-data{grid-template-columns:1fr}}
    `;document.head.appendChild(style);
  }

  function ensureScreen(id,title,eyebrow){
    let screen=$(id);if(screen)return screen;
    screen=document.createElement('section');screen.id=id;screen.className='screen';
    screen.innerHTML=`<div class="admin-page"><div class="admin-head"><div><span>${esc(eyebrow)}</span><h2>${esc(title)}</h2></div><button class="admin-back" type="button">Voltar</button></div><div class="admin-list"></div></div>`;
    document.querySelector('main')?.appendChild(screen);
    screen.querySelector('.admin-back')?.addEventListener('click',()=>show('moreNew'));
    return screen;
  }

  function renderUsers(){
    injectStyles();const active=session();if(active?.profile!=='administrador'){alert('Área exclusiva para administradores.');return}
    const screen=ensureScreen('approveUsersNew','Autorizar usuários','Administração');const list=screen.querySelector('.admin-list');
    const users=readUsers().filter(u=>u.id!=='admin-inicial').sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    if(!users.length){list.innerHTML='<div class="admin-empty">Nenhum cadastro de usuário recebido neste aparelho.</div>';show('approveUsersNew');return}
    list.innerHTML=users.map(u=>`<article class="admin-card"><span class="admin-status ${esc(u.status)}">${esc(statusLabels[u.status]||u.status)}</span><h3>${esc(u.fullName||u.username)}</h3><small>@${esc(u.username||'sem usuário')} · ${esc(labels[u.profile]||u.profile)}</small><div class="admin-data"><span><b>CPF</b>${esc(formatCpf(u.cpf))}</span><span><b>E-mail</b>${esc(u.email||'Não informado')}</span><span><b>Telefone</b>${esc(u.phone||'Não informado')}</span><span><b>Cadastrado em</b>${u.createdAt?new Date(u.createdAt).toLocaleString('pt-BR'):'Não informado'}</span></div><label>Perfil autorizado<select data-admin-profile="${esc(u.id)}"><option value="solicitante" ${u.profile==='solicitante'?'selected':''}>Solicitante de transporte</option><option value="transporte" ${u.profile==='transporte'?'selected':''}>Executante de transporte</option><option value="administrador" ${u.profile==='administrador'?'selected':''}>Administrador</option></select></label><div class="admin-actions"><button class="admin-approve" data-admin-status="ativo" data-admin-id="${esc(u.id)}">Autorizar</button><button class="admin-reject" data-admin-status="recusado" data-admin-id="${esc(u.id)}">Recusar</button>${u.status==='ativo'?`<button class="admin-block" data-admin-status="bloqueado" data-admin-id="${esc(u.id)}">Bloquear</button>`:''}</div></article>`).join('');
    list.querySelectorAll('[data-admin-status]').forEach(button=>button.addEventListener('click',()=>changeStatus(button.dataset.adminId,button.dataset.adminStatus)));
    show('approveUsersNew');
  }

  function changeStatus(id,status){
    const data=readUsers(),i=data.findIndex(u=>u.id===id);if(i<0)return;
    const select=document.querySelector(`[data-admin-profile="${CSS.escape(id)}"]`);if(select)data[i].profile=select.value;
    data[i].status=status;data[i].approvedAt=status==='ativo'?new Date().toISOString():data[i].approvedAt;data[i].approvedBy=session()?.name||'Administrador';saveUsers(data);renderUsers();
  }

  function renderWhatsapp(){
    injectStyles();const active=session();if(active?.profile!=='administrador'){alert('Área exclusiva para administradores.');return}
    const screen=ensureScreen('whatsappAdminNew','Configurar WhatsApp da empresa','Administração');const list=screen.querySelector('.admin-list');
    list.innerHTML=`<form id="whatsappAdminForm" class="admin-card"><label>WhatsApp — Transporte básico<input id="whatsappBasicNew" inputmode="numeric" placeholder="Ex.: 69999999999" value="${esc(localStorage.getItem('heuroWhatsapp')||'')}"></label><p class="admin-help">Informe somente números com DDD. O sistema acrescentará o código do Brasil quando necessário.</p><label>WhatsApp — Transporte UTI<input id="whatsappUtiNew" inputmode="numeric" placeholder="Ex.: 69999999999" value="${esc(localStorage.getItem('heuroWhatsappUti')||'')}"></label><button class="admin-actions admin-save" type="submit">Salvar números</button><p id="whatsappAdminMessage" class="admin-message"></p></form>`;
    list.querySelector('#whatsappAdminForm')?.addEventListener('submit',event=>{event.preventDefault();localStorage.setItem('heuroWhatsapp',$('whatsappBasicNew').value.replace(/\D/g,''));localStorage.setItem('heuroWhatsappUti',$('whatsappUtiNew').value.replace(/\D/g,''));$('whatsappAdminMessage').textContent='Números salvos com sucesso neste aparelho.';});show('whatsappAdminNew');
  }

  function renderSystem(){
    injectStyles();const active=session();if(active?.profile!=='administrador'){alert('Área exclusiva para administradores.');return}
    const screen=ensureScreen('systemAdminNew','Configurações do sistema','Administração');const list=screen.querySelector('.admin-list');
    list.innerHTML=`<div class="admin-card"><h3>Informações do sistema</h3><div class="admin-data"><span><b>Usuários cadastrados</b>${readUsers().length}</span><span><b>Cadastros aguardando</b>${readUsers().filter(u=>normalize(u.status)==='aguardando').length}</span></div><p class="admin-help">As configurações operacionais adicionais serão concentradas nesta área, mantendo o acesso restrito aos administradores.</p></div>`;show('systemAdminNew');
  }

  document.addEventListener('click',event=>{
    const approve=event.target.closest('#moreApproveUsers');const whatsapp=event.target.closest('#moreWhatsapp');const system=event.target.closest('#moreSystem');if(!approve&&!whatsapp&&!system)return;
    event.preventDefault();event.stopImmediatePropagation();if(approve)renderUsers();if(whatsapp)renderWhatsapp();if(system)renderSystem();
  },true);
})();