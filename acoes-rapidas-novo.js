(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const readRequests=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const formatDate=value=>{if(!value)return 'Não informado';const [y,m,d]=value.split('-');return y&&m&&d?`${d}/${m}/${y}`:value};
  const isDone=item=>String(item.status||'').trim().toLowerCase()==='concluído'||String(item.status||'').trim().toLowerCase()==='concluido';
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
      .quick-card{width:100%;text-align:left;border:1px solid #dce4ef;border-radius:17px;background:#fff;padding:16px;box-shadow:0 8px 22px rgba(20,40,80,.08)}
      .quick-card strong{display:block;font-size:17px;margin:7px 0 5px;color:#13213a}
      .quick-card small,.quick-card span{display:block;color:#5f6d82;line-height:1.42}
      .quick-status{display:inline-block!important;width:auto;padding:5px 9px;border-radius:999px;background:#fff0d9;color:#a65a00!important;font-weight:800;font-size:12px}
      .quick-status.done{background:#dcf7e8;color:#08743a!important}
      .quick-empty{background:#fff;border-radius:17px;padding:22px;text-align:center;color:#657389;border:1px solid #dce4ef}
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

  function card(item){
    const location=item.boxNumber?`Box ${esc(item.boxNumber)}`:`Enfermaria ${esc(item.ward||'não informada')} · Leito ${esc(item.bed||'não informado')}`;
    return `<article class="quick-card"><span class="quick-status ${isDone(item)?'done':''}">${esc(item.status||'Solicitado')}</span><strong>${esc(item.patient||'Paciente não informado')}</strong><small>${esc(item.protocol||'Sem protocolo')}</small><span>${esc(item.originSector||'Origem não informada')} · ${location}</span><span>Destino: ${esc(item.destination||'Não informado')}</span><span>${formatDate(item.transportDate)} às ${esc(item.transportTime||'--:--')}</span></article>`;
  }

  function render(screenId,title,eyebrow,filter,sorter,emptyText){
    injectStyles();
    const screen=ensureScreen(screenId,title,eyebrow);
    const list=screen.querySelector('.quick-list');
    let data=readRequests().filter(filter);
    if(sorter)data=data.sort(sorter);
    list.innerHTML=data.length?data.map(card).join(''):`<div class="quick-empty">${esc(emptyText)}</div>`;
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

  bind('cmdPending',()=>render(
    'pendingNew','Solicitações pendentes','Ações rápidas',
    item=>!isDone(item),
    (a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0),
    'Nenhuma solicitação pendente no momento.'
  ));

  bind('cmdAgenda',()=>render(
    'agendaNew','Agenda de transportes','Programação',
    item=>!isDone(item)&&Boolean(item.transportDate),
    (a,b)=>`${a.transportDate||''}T${a.transportTime||''}`.localeCompare(`${b.transportDate||''}T${b.transportTime||''}`),
    'Nenhum transporte programado na agenda.'
  ));

  bind('cmdHistory',()=>render(
    'historyNew','Histórico de transportes','Consultas',
    item=>isDone(item),
    (a,b)=>new Date(b.completedAt||b.createdAt||0)-new Date(a.completedAt||a.createdAt||0),
    'Nenhum transporte concluído no histórico.'
  ));
})();