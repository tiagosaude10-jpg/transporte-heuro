const $ = (id) => document.getElementById(id);
const loginScreen = $('loginScreen');
const homeScreen = $('homeScreen');
const views = ['requestView','listView','settingsView','detailView'].map($);
const profileLabels = { solicitante:'Solicitante', transporte:'Empresa de transporte', administrador:'Administrador' };
let currentProfile = 'solicitante';

function requests(){ return JSON.parse(localStorage.getItem('heuroRequests') || '[]'); }
function saveRequests(data){ localStorage.setItem('heuroRequests', JSON.stringify(data)); }
function cleanPhone(value){ const n=(value||'').replace(/\D/g,''); return n.startsWith('55') ? n : `55${n}`; }
function formatDate(value){ if(!value) return 'Não informado'; const [y,m,d]=value.split('-'); return `${d}/${m}/${y}`; }
function escapeHtml(value=''){ return String(value).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function protocol(){ const d=new Date(); const date=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`; return `HEURO-${date}-${String(Date.now()).slice(-5)}`; }
function showScreen(screen){ loginScreen.classList.remove('active'); homeScreen.classList.remove('active'); screen.classList.add('active'); }
function showDashboard(){ views.forEach(v=>v.classList.add('hidden')); $('dashboard').classList.remove('hidden'); }
function showView(id){ $('dashboard').classList.add('hidden'); views.forEach(v=>v.classList.add('hidden')); $(id).classList.remove('hidden'); if(id==='listView') renderList(); }

$('loginForm').addEventListener('submit', e=>{
  e.preventDefault();
  if($('password').value!=='1234') return alert('Senha provisória incorreta. Use 1234.');
  currentProfile=$('profile').value;
  const session={name:$('userName').value.trim()||'Usuário',profile:currentProfile};
  if($('rememberUser').checked) localStorage.setItem('heuroUser',JSON.stringify(session));
  sessionStorage.setItem('heuroSession',JSON.stringify(session));
  $('welcomeName').textContent=`Olá, ${session.name}`;
  $('welcomeRole').textContent=profileLabels[currentProfile];
  showScreen(homeScreen); showDashboard();
});

$('logoutButton').addEventListener('click',()=>{ sessionStorage.removeItem('heuroSession'); showScreen(loginScreen); });
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(`${b.dataset.view}View`)));
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',showDashboard));

$('settingsForm').addEventListener('submit',e=>{ e.preventDefault(); localStorage.setItem('heuroWhatsapp',$('whatsappNumber').value.replace(/\D/g,'')); alert('Número salvo neste aparelho.'); showDashboard(); });
$('whatsappNumber').value=localStorage.getItem('heuroWhatsapp')||'';

$('requestForm').addEventListener('submit',e=>{
  e.preventDefault();
  const file=$('attachment').files[0];
  const item={
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), protocol:protocol(), status:'Solicitado', createdAt:new Date().toISOString(),
    requester:JSON.parse(sessionStorage.getItem('heuroSession')||'{}').name||'Usuário', patient:$('patient').value.trim(), birthDate:$('birthDate').value,
    originSector:$('originSector').value, ward:$('ward').value.trim(), bed:$('bed').value.trim(), destination:$('destination').value.trim(),
    transportDate:$('transportDate').value, transportTime:$('transportTime').value,
    ambulanceType:$('ambulanceType').value, priority:$('priority').value, team:$('team').value, oxygen:$('oxygen').value,
    contact:$('contact').value.trim(), notes:$('notes').value.trim(), attachmentName:file?file.name:'Nenhum documento informado'
  };
  const data=requests(); data.unshift(item); saveRequests(data); $('requestForm').reset(); alert(`Solicitação ${item.protocol} salva.`); openDetail(item.id);
});

function renderList(){
  const data=requests(); const box=$('requestList');
  if(!data.length){ box.innerHTML='<div class="card empty">Nenhuma solicitação registrada neste aparelho.</div>'; return; }
  box.innerHTML=data.map(r=>`<button class="request-card" data-id="${r.id}"><span class="status ${r.status==='Concluído'?'done':''}">${r.status}</span><strong>${escapeHtml(r.patient)}</strong><small>${escapeHtml(r.protocol)}</small><small>${formatDate(r.transportDate)} às ${escapeHtml(r.transportTime)}</small><span>${escapeHtml(r.originSector||r.origin||'Origem não informada')} → ${escapeHtml(r.destination)}</span></button>`).join('');
  box.querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.id)));
}

function message(r){ return `*SOLICITAÇÃO DE TRANSPORTE HEURO*\n\nProtocolo: ${r.protocol}\nPaciente: ${r.patient}\nSetor de origem: ${r.originSector||r.origin||'Não informado'}\nEnfermaria: ${r.ward||'Não informada'}\nLeito: ${r.bed||'Não informado'}\nDestino: ${r.destination}\nData: ${formatDate(r.transportDate)} às ${r.transportTime}\nAmbulância: ${r.ambulanceType}\nPrioridade: ${r.priority}\nEquipe: ${r.team}\nOxigênio: ${r.oxygen}\nDocumento: ${r.attachmentName}\nObservações: ${r.notes||'Sem observações'}\n\nSolicitação registrada no aplicativo Transporte HEURO.`; }

function openDetail(id){
  const r=requests().find(x=>x.id===id); if(!r) return;
  showView('detailView');
  $('detailContent').innerHTML=`
    <div class="section-head no-print"><div><span class="eyebrow dark">${escapeHtml(r.protocol)}</span><h3>Solicitação de transporte</h3></div><button class="back-button" id="detailBack">Voltar</button></div>
    <div class="print-header"><h2>TRANSPORTE HEURO</h2><p>Solicitação de transporte</p></div>
    <div class="detail-grid">
      <p><b>Status</b><span>${escapeHtml(r.status)}</span></p><p><b>Paciente</b><span>${escapeHtml(r.patient)}</span></p>
      <p><b>Nascimento</b><span>${formatDate(r.birthDate)}</span></p><p><b>Solicitante</b><span>${escapeHtml(r.requester)}</span></p>
      <p><b>Setor de origem</b><span>${escapeHtml(r.originSector||r.origin||'Não informado')}</span></p><p><b>Destino</b><span>${escapeHtml(r.destination)}</span></p>
      <p><b>Enfermaria</b><span>${escapeHtml(r.ward||'Não informada')}</span></p><p><b>Leito</b><span>${escapeHtml(r.bed||'Não informado')}</span></p>
      <p><b>Data e hora</b><span>${formatDate(r.transportDate)} às ${escapeHtml(r.transportTime)}</span></p><p><b>Prioridade</b><span>${escapeHtml(r.priority)}</span></p>
      <p><b>Ambulância</b><span>${escapeHtml(r.ambulanceType)}</span></p><p><b>Equipe</b><span>${escapeHtml(r.team)}</span></p>
      <p><b>Oxigênio</b><span>${escapeHtml(r.oxygen)}</span></p><p><b>Contato</b><span>${escapeHtml(r.contact||'Não informado')}</span></p>
      <p class="wide"><b>Documento da regulação</b><span>${escapeHtml(r.attachmentName)}</span></p><p class="wide"><b>Observações</b><span>${escapeHtml(r.notes||'Sem observações')}</span></p>
    </div>
    <div class="detail-actions no-print"><button id="printButton" class="secondary-button">Gerar / salvar PDF</button><button id="whatsappButton" class="whatsapp-button">Encaminhar ao WhatsApp</button>${r.status!=='Concluído'?'<button id="finishButton" class="success-button">Concluir transporte</button>':''}</div>`;
  $('detailBack').onclick=()=>showView('listView');
  $('printButton').onclick=()=>window.print();
  $('whatsappButton').onclick=()=>{ const n=localStorage.getItem('heuroWhatsapp'); if(!n){ alert('Cadastre primeiro o número do transporte em Configuração.'); return; } window.open(`https://wa.me/${cleanPhone(n)}?text=${encodeURIComponent(message(r))}`,'_blank'); };
  if($('finishButton')) $('finishButton').onclick=()=>{ const data=requests(); const i=data.findIndex(x=>x.id===id); data[i].status='Concluído'; data[i].completedAt=new Date().toISOString(); saveRequests(data); openDetail(id); };
}

const saved=localStorage.getItem('heuroUser'); if(saved){ try{ const s=JSON.parse(saved); $('userName').value=s.name||'Tiago'; $('profile').value=s.profile||'solicitante'; }catch{} }
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));