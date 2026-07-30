const $ = (id) => document.getElementById(id);
const welcomeScreen = $('welcomeScreen');
const loginScreen = $('loginScreen');
const registerScreen = $('registerScreen');
const homeScreen = $('homeScreen');
const views = ['requestView','listView','usersView','settingsView','detailView'].map($);
const profileLabels = { solicitante:'Solicitante de transporte', transporte:'Executante de transporte', administrador:'Administrador' };
let currentProfile = '';

function getUsers(){ return JSON.parse(localStorage.getItem('heuroUsers') || '[]'); }
function saveUsers(data){ localStorage.setItem('heuroUsers', JSON.stringify(data)); }
function requests(){ return JSON.parse(localStorage.getItem('heuroRequests') || '[]'); }
function saveRequests(data){ localStorage.setItem('heuroRequests', JSON.stringify(data)); }
function cleanDigits(value){ return (value || '').replace(/\D/g,''); }
function cleanPhone(value){ const n=cleanDigits(value); return n.startsWith('55') ? n : `55${n}`; }
function normalize(value){ return String(value || '').trim().toLowerCase(); }
function formatDate(value){ if(!value) return 'Não informado'; const [y,m,d]=value.split('-'); return `${d}/${m}/${y}`; }
function escapeHtml(value=''){ return String(value).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function protocol(){ const d=new Date(); const date=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`; return `HEURO-${date}-${String(Date.now()).slice(-5)}`; }
function showScreen(screen){ [welcomeScreen,loginScreen,registerScreen,homeScreen].forEach(s=>s.classList.remove('active')); screen.classList.add('active'); window.scrollTo(0,0); }
function showDashboard(){ views.forEach(v=>v.classList.add('hidden')); $('dashboard').classList.remove('hidden'); updatePendingBadge(); }
function showView(id){ $('dashboard').classList.add('hidden'); views.forEach(v=>v.classList.add('hidden')); $(id).classList.remove('hidden'); if(id==='listView') renderList(); if(id==='usersView') renderUsers(); }
function setMessage(id,text,type='error'){ const el=$(id); el.textContent=text; el.className=`form-message ${type}`; }
function session(){ try{return JSON.parse(sessionStorage.getItem('heuroSession')||'null');}catch{return null;} }

function seedFirstAdmin(){
  const users=getUsers();
  if(users.length) return;
  users.push({
    id:'admin-inicial', fullName:'Tiago Pereira de Albuquerque', cpf:'', email:'', phone:'',
    username:'Tiago', password:'1234', profile:'administrador', status:'ativo',
    createdAt:new Date().toISOString(), approvedAt:new Date().toISOString(), approvedBy:'Configuração inicial'
  });
  saveUsers(users);
}
seedFirstAdmin();

$('welcomeEnter').addEventListener('click',()=>showScreen(loginScreen));
$('welcomeChangeUser').addEventListener('click',()=>{
  localStorage.removeItem('heuroRememberedUser');
  sessionStorage.removeItem('heuroSession');
  $('userName').value=''; $('password').value='';
  showScreen(loginScreen); setTimeout(()=>$('userName').focus(),50);
});
$('openRegister').addEventListener('click',()=>{ $('registerForm').reset(); setMessage('registerMessage',''); showScreen(registerScreen); });
$('registerBack').addEventListener('click',()=>showScreen(loginScreen));

$('cpf').addEventListener('input',e=>{
  let v=cleanDigits(e.target.value).slice(0,11);
  v=v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  e.target.value=v;
});

$('registerForm').addEventListener('submit',e=>{
  e.preventDefault();
  const selected=document.querySelector('input[name="registerProfile"]:checked');
  const cpf=cleanDigits($('cpf').value);
  const email=normalize($('email').value);
  const username=$('newUserName').value.trim();
  const password=$('newPassword').value;
  const users=getUsers();
  if(!selected) return setMessage('registerMessage','Selecione o tipo de acesso solicitado.');
  if(cpf.length!==11) return setMessage('registerMessage','Informe um CPF com 11 números.');
  if(password!==$('confirmPassword').value) return setMessage('registerMessage','As senhas não coincidem.');
  if(users.some(u=>u.cpf && u.cpf===cpf)) return setMessage('registerMessage','Já existe um cadastro vinculado a este CPF.');
  if(users.some(u=>u.email && normalize(u.email)===email)) return setMessage('registerMessage','Já existe um cadastro vinculado a este e-mail.');
  if(users.some(u=>normalize(u.username)===normalize(username))) return setMessage('registerMessage','Este nome de usuário já está sendo utilizado.');
  users.push({
    id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),
    fullName:$('fullName').value.trim(), cpf, email, phone:$('phone').value.trim(), username, password,
    profile:selected.value, status:'aguardando', createdAt:new Date().toISOString(), approvedAt:null, approvedBy:null
  });
  saveUsers(users);
  $('registerForm').reset();
  setMessage('registerMessage','Cadastro enviado com sucesso. Aguarde a autorização de um administrador.','success');
  setTimeout(()=>{ showScreen(loginScreen); setMessage('loginMessage','Cadastro enviado. O acesso será liberado após autorização do administrador.','success'); },900);
});

$('loginForm').addEventListener('submit',e=>{
  e.preventDefault(); setMessage('loginMessage','');
  const username=normalize($('userName').value); const password=$('password').value;
  const user=getUsers().find(u=>normalize(u.username)===username);
  if(!user || user.password!==password) return setMessage('loginMessage','Nome de usuário ou senha incorretos.');
  if(user.status==='aguardando') return setMessage('loginMessage','Seu cadastro ainda está aguardando autorização do administrador.');
  if(user.status==='recusado') return setMessage('loginMessage','Este cadastro foi recusado. Procure o administrador do sistema.');
  if(user.status!=='ativo') return setMessage('loginMessage','Este usuário está bloqueado ou inativo.');
  currentProfile=user.profile;
  const activeSession={id:user.id,name:user.fullName||user.username,username:user.username,profile:user.profile};
  sessionStorage.setItem('heuroSession',JSON.stringify(activeSession));
  if($('rememberUser').checked) localStorage.setItem('heuroRememberedUser',user.username); else localStorage.removeItem('heuroRememberedUser');
  enterHome(activeSession);
});

function enterHome(s){
  currentProfile=s.profile; $('welcomeName').textContent=`Olá, ${s.name}`; $('welcomeRole').textContent=profileLabels[s.profile]||s.profile;
  $('usersCard').classList.toggle('hidden',s.profile!=='administrador');
  $('newRequestCard').classList.toggle('hidden',s.profile==='transporte');
  $('settingsCard').classList.toggle('hidden',s.profile!=='administrador');
  showScreen(homeScreen); showDashboard();
}

$('logoutButton').addEventListener('click',()=>{ sessionStorage.removeItem('heuroSession'); $('password').value=''; showScreen(welcomeScreen); });
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(`${b.dataset.view}View`)));
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',showDashboard));

function updatePendingBadge(){
  const count=getUsers().filter(u=>u.status==='aguardando').length;
  $('pendingBadge').textContent=count; $('pendingBadge').classList.toggle('hidden',!count);
}

function renderUsers(){
  if(currentProfile!=='administrador'){ showDashboard(); return; }
  const users=getUsers().filter(u=>u.id!=='admin-inicial').sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const box=$('userApprovalList');
  if(!users.length){ box.innerHTML='<div class="card empty">Nenhum cadastro de usuário recebido neste aparelho.</div>'; return; }
  box.innerHTML=users.map(u=>`<article class="card user-card">
    <div class="user-card-head"><div><span class="status ${u.status==='ativo'?'done':u.status==='recusado'?'rejected':''}">${statusLabel(u.status)}</span><h4>${escapeHtml(u.fullName)}</h4><small>@${escapeHtml(u.username)} · ${escapeHtml(profileLabels[u.profile])}</small></div></div>
    <div class="user-data"><span><b>CPF</b>${escapeHtml(formatCpf(u.cpf))}</span><span><b>E-mail</b>${escapeHtml(u.email)}</span><span><b>Telefone</b>${escapeHtml(u.phone)}</span></div>
    <label class="compact-label">Perfil autorizado<select data-profile="${u.id}"><option value="solicitante" ${u.profile==='solicitante'?'selected':''}>Solicitante de transporte</option><option value="transporte" ${u.profile==='transporte'?'selected':''}>Executante de transporte</option><option value="administrador" ${u.profile==='administrador'?'selected':''}>Administrador</option></select></label>
    <div class="approval-actions"><button class="success-button" data-approve="${u.id}">Autorizar</button><button class="danger-button" data-reject="${u.id}">Recusar</button>${u.status==='ativo'?`<button class="secondary-button" data-block="${u.id}">Bloquear</button>`:''}</div>
  </article>`).join('');
  box.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>changeUserStatus(b.dataset.approve,'ativo'));
  box.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>changeUserStatus(b.dataset.reject,'recusado'));
  box.querySelectorAll('[data-block]').forEach(b=>b.onclick=()=>changeUserStatus(b.dataset.block,'bloqueado'));
}
function changeUserStatus(id,status){
  const data=getUsers(); const i=data.findIndex(u=>u.id===id); if(i<0) return;
  const profileSelect=document.querySelector(`[data-profile="${id}"]`);
  if(profileSelect) data[i].profile=profileSelect.value;
  data[i].status=status; data[i].approvedAt=status==='ativo'?new Date().toISOString():data[i].approvedAt; data[i].approvedBy=session()?.name||'Administrador';
  saveUsers(data); renderUsers(); updatePendingBadge();
}
function statusLabel(status){ return ({aguardando:'Aguardando autorização',ativo:'Ativo',recusado:'Recusado',bloqueado:'Bloqueado',inativo:'Inativo'})[status]||status; }
function formatCpf(cpf){ const v=cleanDigits(cpf); return v.length===11?v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'):'Não informado'; }

$('settingsForm').addEventListener('submit',e=>{ e.preventDefault(); localStorage.setItem('heuroWhatsapp',$('whatsappNumber').value.replace(/\D/g,'')); alert('Número salvo neste aparelho.'); showDashboard(); });
$('whatsappNumber').value=localStorage.getItem('heuroWhatsapp')||'';

$('requestForm').addEventListener('submit',e=>{
  e.preventDefault(); const file=$('attachment').files[0]; const s=session();
  const item={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),protocol:protocol(),status:'Solicitado',createdAt:new Date().toISOString(),requester:s?.name||'Usuário',requesterId:s?.id||'',patient:$('patient').value.trim(),birthDate:$('birthDate').value,originSector:$('originSector').value,ward:$('ward').value.trim(),bed:$('bed').value.trim(),destination:$('destination').value.trim(),transportDate:$('transportDate').value,transportTime:$('transportTime').value,ambulanceType:$('ambulanceType').value,priority:$('priority').value,team:$('team').value,oxygen:$('oxygen').value,contact:$('contact').value.trim(),notes:$('notes').value.trim(),attachmentName:file?file.name:'Nenhum documento informado'};
  const data=requests(); data.unshift(item); saveRequests(data); $('requestForm').reset(); alert(`Solicitação ${item.protocol} salva.`); openDetail(item.id);
});

function visibleRequests(){ const s=session(); const data=requests(); return s?.profile==='solicitante'?data.filter(r=>r.requesterId===s.id||(!r.requesterId&&r.requester===s.name)):data; }
function renderList(){ const data=visibleRequests(); const box=$('requestList'); if(!data.length){ box.innerHTML='<div class="card empty">Nenhuma solicitação disponível para este usuário.</div>'; return; } box.innerHTML=data.map(r=>`<button class="request-card" data-id="${r.id}"><span class="status ${r.status==='Concluído'?'done':''}">${r.status}</span><strong>${escapeHtml(r.patient)}</strong><small>${escapeHtml(r.protocol)}</small><small>${formatDate(r.transportDate)} às ${escapeHtml(r.transportTime)}</small><span>${escapeHtml(r.originSector||r.origin||'Origem não informada')} → ${escapeHtml(r.destination)}</span></button>`).join(''); box.querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.id))); }
function message(r){ return `*SOLICITAÇÃO DE TRANSPORTE HEURO*\n\nProtocolo: ${r.protocol}\nPaciente: ${r.patient}\nSetor de origem: ${r.originSector||r.origin||'Não informado'}\nEnfermaria: ${r.ward||'Não informada'}\nLeito: ${r.bed||'Não informado'}\nDestino: ${r.destination}\nData: ${formatDate(r.transportDate)} às ${r.transportTime}\nAmbulância: ${r.ambulanceType}\nPrioridade: ${r.priority}\nEquipe: ${r.team}\nOxigênio: ${r.oxygen}\nDocumento: ${r.attachmentName}\nObservações: ${r.notes||'Sem observações'}\n\nSolicitação registrada no aplicativo Transporte HEURO.`; }
function openDetail(id){
  const r=visibleRequests().find(x=>x.id===id); if(!r) return; showView('detailView'); const canFinish=currentProfile==='transporte'||currentProfile==='administrador';
  $('detailContent').innerHTML=`<div class="section-head no-print"><div><span class="eyebrow dark">${escapeHtml(r.protocol)}</span><h3>Solicitação de transporte</h3></div><button class="back-button" id="detailBack">Voltar</button></div><div class="print-header"><h2>TRANSPORTE HEURO</h2><p>Solicitação de transporte</p></div><div class="detail-grid"><p><b>Status</b><span>${escapeHtml(r.status)}</span></p><p><b>Paciente</b><span>${escapeHtml(r.patient)}</span></p><p><b>Nascimento</b><span>${formatDate(r.birthDate)}</span></p><p><b>Solicitante</b><span>${escapeHtml(r.requester)}</span></p><p><b>Setor de origem</b><span>${escapeHtml(r.originSector||r.origin||'Não informado')}</span></p><p><b>Destino</b><span>${escapeHtml(r.destination)}</span></p><p><b>Enfermaria</b><span>${escapeHtml(r.ward||'Não informada')}</span></p><p><b>Leito</b><span>${escapeHtml(r.bed||'Não informado')}</span></p><p><b>Data e hora</b><span>${formatDate(r.transportDate)} às ${escapeHtml(r.transportTime)}</span></p><p><b>Prioridade</b><span>${escapeHtml(r.priority)}</span></p><p><b>Ambulância</b><span>${escapeHtml(r.ambulanceType)}</span></p><p><b>Equipe</b><span>${escapeHtml(r.team)}</span></p><p><b>Oxigênio</b><span>${escapeHtml(r.oxygen)}</span></p><p><b>Contato</b><span>${escapeHtml(r.contact||'Não informado')}</span></p><p class="wide"><b>Documento da regulação</b><span>${escapeHtml(r.attachmentName)}</span></p><p class="wide"><b>Observações</b><span>${escapeHtml(r.notes||'Sem observações')}</span></p></div><div class="detail-actions no-print"><button id="printButton" class="secondary-button">Gerar / salvar PDF</button><button id="whatsappButton" class="whatsapp-button">Encaminhar ao WhatsApp</button>${canFinish&&r.status!=='Concluído'?'<button id="finishButton" class="success-button">Concluir transporte</button>':''}</div>`;
  $('detailBack').onclick=()=>showView('listView'); $('printButton').onclick=()=>window.print(); $('whatsappButton').onclick=()=>{ const n=localStorage.getItem('heuroWhatsapp'); if(!n){ alert('Cadastre primeiro o número do transporte em Configuração.'); return; } window.open(`https://wa.me/${cleanPhone(n)}?text=${encodeURIComponent(message(r))}`,'_blank'); }; if($('finishButton')) $('finishButton').onclick=()=>{ const data=requests(); const i=data.findIndex(x=>x.id===id); data[i].status='Concluído'; data[i].completedAt=new Date().toISOString(); data[i].completedBy=session()?.name||'Usuário'; saveRequests(data); openDetail(id); };
}

const remembered=localStorage.getItem('heuroRememberedUser'); if(remembered) $('userName').value=remembered;
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js?v=10'));