(()=>{
'use strict';
const DB='heuroTransportFiles',STORE='attachments';
const $=id=>document.getElementById(id);
const session=()=>{try{return JSON.parse(sessionStorage.getItem('heuroSession')||'null')}catch{return null}};
const read=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
const save=data=>localStorage.setItem('heuroRequests',JSON.stringify(data));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate=v=>{if(!v)return'Não informado';const [y,m,d]=String(v).split('-');return y&&m&&d?`${d}/${m}/${y}`:v};
function openDb(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function deleteAttachment(id){const db=await openDb();await new Promise((ok,no)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=ok;tx.onerror=()=>no(tx.error)});db.close()}
function profileRules(){const s=session();const isExec=s?.profile==='transporte';const b=$('cmdNew');if(b){b.style.display=isExec?'none':'';b.setAttribute('aria-disabled',isExec?'true':'false')}}
function historyEntry(status){const s=session();return{status,at:new Date().toISOString(),by:s?.name||'Usuário',userId:s?.id||''}}
async function updateStatus(id,status){const data=read();const item=data.find(x=>x.id===id);if(!item)return;item.status=status;item.history=[...(item.history||[]),historyEntry(status)];const s=session();if(status==='Aceito'){item.executor=s?.name||'Executante';item.executorId=s?.id||'';item.acceptedAt=new Date().toISOString()}
if(status==='Em deslocamento')item.startedAt=new Date().toISOString();
if(status==='Concluído'){
 item.completedAt=new Date().toISOString();
 item.executor=item.executor||s?.name||'Executante';
 save(data);
 try{await deleteAttachment(item.id);item.attachmentDeletedAt=new Date().toISOString();item.attachmentName='Imagem excluída após conclusão';item.attachmentAvailable=false;save(data)}catch(e){console.error(e);alert('A conclusão foi salva, mas não foi possível apagar a imagem. Tente novamente.');return}
 alert('Transporte concluído. A imagem e o PDF temporário foram eliminados. Os dados permanecem disponíveis.');
}else save(data);
renderActions();
}
function nextActions(item){const p=session()?.profile;const can=p==='transporte'||p==='administrador';if(!can)return'';if(item.status==='Solicitado')return`<button data-status="Aceito">Aceitar transporte</button>`;if(item.status==='Aceito')return`<button data-status="Em deslocamento">Iniciar deslocamento</button>`;if(item.status==='Em deslocamento')return`<button data-status="Concluído">Finalizar transporte</button>`;return''}
function renderActions(){profileRules();document.querySelectorAll('#teamListNew .transport-card').forEach((card,i)=>{const item=read().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))[i];if(!item)return;let box=card.querySelector('.heuro-cycle-actions');if(!box){box=document.createElement('div');box.className='heuro-cycle-actions';box.style.cssText='display:grid;gap:8px;margin-top:12px';card.appendChild(box)}box.innerHTML=`${nextActions(item)}<button data-pdf="1" style="background:#0b5fa5;color:#fff">Gerar PDF dos dados</button>`;box.querySelectorAll('button').forEach(b=>{b.style.cssText+=';min-height:44px;border:0;border-radius:12px;padding:10px 14px;font-weight:800';b.dataset.id=item.id})})}
async function loadPdf(){if(window.jspdf?.jsPDF)return;await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
async function dataPdf(item){await loadPdf();const {jsPDF}=window.jspdf;const d=new jsPDF({unit:'mm',format:'a4'});d.setFontSize(16);d.text('TRANSPORTE HEURO',105,16,{align:'center'});d.setFontSize(10);let y=28;const rows=[['Protocolo',item.protocol],['Status',item.status],['Paciente',item.patient],['Nascimento',formatDate(item.birthDate)],['Origem',`${item.originSector||''} ${item.boxNumber?'- Box '+item.boxNumber:`- ${item.ward||''} / Leito ${item.bed||''}`}`],['Destino',item.destination],['Data e hora',`${formatDate(item.transportDate)} às ${item.transportTime||''}`],['Ambulância',item.ambulanceType],['Prioridade',item.priority],['Oxigênio',item.oxygen],['Solicitante',item.requester],['Executante',item.executor||'Não definido'],['Observações',item.notes||'Sem observações']];for(const [l,v] of rows){d.setFont('helvetica','bold');d.text(`${l}:`,16,y);d.setFont('helvetica','normal');const lines=d.splitTextToSize(String(v||'Não informado'),145);d.text(lines,48,y);y+=Math.max(7,lines.length*5+2);if(y>280){d.addPage();y=18}}d.save(`Transporte HEURO - ${item.protocol}.pdf`)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-status],[data-pdf]');if(!b)return;const item=read().find(x=>x.id===b.dataset.id);if(!item)return;if(b.dataset.status){if(b.dataset.status==='Concluído'&&!confirm('Finalizar o transporte e apagar definitivamente a imagem anexada?'))return;updateStatus(item.id,b.dataset.status)}else dataPdf(item).catch(()=>alert('Não foi possível gerar o PDF dos dados.'))},true);
const obs=new MutationObserver(()=>{profileRules();if(document.querySelector('#teamNew.active'))renderActions()});obs.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
document.addEventListener('click',e=>{if(e.target.closest('#cmdNew')&&session()?.profile==='transporte'){e.preventDefault();e.stopImmediatePropagation();alert('O perfil executante não pode criar solicitações.');}},true);
profileRules();setTimeout(renderActions,300);
})();