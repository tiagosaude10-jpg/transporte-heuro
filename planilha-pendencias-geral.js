(()=>{
'use strict';
const $=id=>document.getElementById(id);
const read=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dt=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`};
const dmy=v=>{if(!v)return'—';const[y,m,d]=String(v).split('-');return y&&m&&d?`${d}/${m}/${y}`:'—'};
const scheduled=i=>i.transportDate&&i.transportTime?`${dmy(i.transportDate)} - ${i.transportTime}`:'—';
const origin=i=>i.boxNumber?`${i.originSector||'Não informada'} - Box ${i.boxNumber}`:`${i.originSector||'Não informada'} - ${i.ward||'Enfermaria não informada'} / Leito ${i.bed||'não informado'}`;
const isPending=i=>['Solicitado','Aceito'].includes(i.status);
let selectedId='';
let selected=new Set();
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id)?.classList.add('active');window.scrollTo(0,0)}
function ensure(){
 let s=$('pendingSheetNew');if(s)return s;
 s=document.createElement('section');s.id='pendingSheetNew';s.className='screen';
 s.innerHTML='<div class="pending-sheet-page"><div class="pending-sheet-head"><div><span>VISUALIZAÇÃO GERAL</span><h2>Planilha de pendências</h2><p>Consulta das solicitações aguardando aceite e dos transportes aceitos/em andamento.</p></div><button id="pendingSheetBack" type="button">Voltar</button></div><div id="pendingSheetContent" class="pending-sheet-content"></div></div>';
 document.querySelector('main')?.appendChild(s);
 if(!$('pendingSheetStyles')){const st=document.createElement('style');st.id='pendingSheetStyles';st.textContent=`
#pendingSheetNew.active{position:fixed;inset:0;background:#f4f7fb;overflow:hidden;z-index:10020;padding-top:env(safe-area-inset-top,0px)}
.pending-sheet-page{height:100%;display:flex;flex-direction:column;max-width:100%;overflow:hidden}
.pending-sheet-head{flex:0 0 auto;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:16px 14px;background:#fff;border-bottom:1px solid #dbe5ef;box-shadow:0 5px 14px rgba(20,40,80,.08);z-index:6}
.pending-sheet-head span{font-size:11px;font-weight:900;letter-spacing:.1em;color:#0b5fa5}.pending-sheet-head h2{margin:4px 0 3px;color:#17324f;font-size:23px}.pending-sheet-head p{margin:0;color:#66758a;font-size:13px}
#pendingSheetBack{border:0;border-radius:11px;padding:10px 14px;background:#e8eef7;color:#17324f;font-weight:800}
.pending-sheet-content{flex:1 1 auto;min-height:0;padding:14px;overflow:hidden;display:flex;flex-direction:column;gap:10px}
.pending-sheet-tools{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px;background:#fff;border:1px solid #dbe5ef;border-radius:14px;box-shadow:0 5px 14px rgba(20,40,80,.06)}
.pending-sheet-tool{min-height:42px;border:0;border-radius:10px;padding:0 13px;font-weight:900}.pending-sheet-tool.secondary{background:#e8eef7;color:#243b64}.pending-sheet-tool.primary{background:#0b5fa5;color:#fff}.pending-sheet-tool.table-pdf{background:#5b3f82;color:#fff}.pending-sheet-tool:disabled{opacity:.45}.pending-selected-count{color:#243b64;font-size:13px}
.pending-sheet-wrap{flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;background:#fff;border:1px solid #dbe5ef;border-radius:16px;box-shadow:0 8px 22px rgba(20,40,80,.07)}
.pending-sheet-table{border-collapse:separate;border-spacing:0;min-width:1940px;width:100%}.pending-sheet-table th,.pending-sheet-table td{padding:11px;text-align:center;white-space:nowrap;border-bottom:1px solid #b9d4ed}.pending-sheet-table th{position:sticky;top:0;z-index:4;background:#eaf3fb;color:#17324f;font-weight:900}.pending-sheet-table tr.pending-row td{background:#fff5e8}.pending-sheet-table tr.accepted-row td{background:#eaf8ef}.pending-sheet-table tr.highlight td{outline:3px solid #0b6fc1;outline-offset:-3px}.status-pending,.status-accepted{display:inline-block;padding:6px 9px;border-radius:999px;color:#fff;font-weight:900}.status-pending{background:#d86500}.status-accepted{background:#08743a}.ps-pdf{border:0;border-radius:10px;padding:9px 12px;background:#243b64;color:#fff;font-weight:900;white-space:nowrap}.pending-select{width:22px;height:22px;accent-color:#0b5fa5}
`;document.head.appendChild(st)}return s
}
function row(i){const accepted=i.status==='Aceito';const cls=accepted?'accepted-row':'pending-row';const status=accepted?'Aceito / Em andamento':'Solicitado';return `<tr data-id="${esc(i.id)}" class="${cls}${String(i.id)===String(selectedId)?' highlight':''}"><td><input class="pending-select" data-select-id="${esc(i.id)}" type="checkbox" ${selected.has(String(i.id))?'checked':''} aria-label="Selecionar ${esc(i.patient||'transporte')}"></td><td>${esc(i.protocol||'—')}</td><td>${esc(dt(i.createdAt))}</td><td>${esc(dt(i.acceptedAt))}</td><td>${esc(i.patient||'Paciente')}</td><td>${esc(origin(i))}</td><td>${esc(i.destination||'Não informado')}</td><td>${esc(scheduled(i))}</td><td><span class="${accepted?'status-accepted':'status-pending'}">${status}</span></td><td>${esc(i.requester||'Não informado')}</td><td>${esc(i.executor||'—')}</td><td><button class="ps-pdf" data-pdf-id="${esc(i.id)}">Abrir PDF</button></td></tr>`}
function updateSelectionUi(){const count=$('pendingSelectedCount');if(count)count.textContent=`${selected.size} transporte(s) selecionado(s)`;['generateSelectedPendingPdf','generateSelectedPendingTablePdf'].forEach(id=>{const btn=$(id);if(btn)btn.disabled=selected.size===0})}
function render(){
 ensure();
 const data=read().filter(isPending).sort((a,b)=>new Date(`${a.transportDate||'9999-12-31'}T${a.transportTime||'23:59'}`)-new Date(`${b.transportDate||'9999-12-31'}T${b.transportTime||'23:59'}`));
 const visible=new Set(data.map(i=>String(i.id)));selected=new Set([...selected].filter(id=>visible.has(id)));
 const heads=['Selecionar','Protocolo','Solicitado em','Aceite em','Paciente','Origem','Destino','Horário agendado','Status','Solicitado por','Aceito por','PDF'];
 $('pendingSheetContent').innerHTML=`<div class="pending-sheet-tools"><button id="selectAllPending" class="pending-sheet-tool secondary" type="button">Marcar todos</button><button id="clearPendingSelection" class="pending-sheet-tool secondary" type="button">Limpar seleção</button><button id="generateSelectedPendingPdf" class="pending-sheet-tool primary" type="button" ${selected.size?'':'disabled'}>Gerar PDFs dos transportes</button><button id="generateSelectedPendingTablePdf" class="pending-sheet-tool table-pdf" type="button" ${selected.size?'':'disabled'}>Gerar planilha selecionada</button><strong id="pendingSelectedCount" class="pending-selected-count">${selected.size} transporte(s) selecionado(s)</strong></div><div class="pending-sheet-wrap"><table class="pending-sheet-table"><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${data.map(row).join('')||'<tr><td colspan="12" style="padding:24px">Nenhuma pendência encontrada.</td></tr>'}</tbody></table></div>`;
 show('pendingSheetNew');setTimeout(()=>{document.querySelector('#pendingSheetNew tr.highlight')?.scrollIntoView({block:'center',inline:'center'})},80)
}
async function pdf(id){const i=read().find(x=>String(x.id)===String(id));if(!i)return alert('Transporte não encontrado.');try{if(window.HeuroPdf?.build){const doc=await window.HeuroPdf.build(i,{includeImage:true});doc.save(`Transporte HEURO - ${i.protocol||i.id}.pdf`);return}if(window.pdfSolicitacaoModelo?.gerar){await window.pdfSolicitacaoModelo.gerar(i,{includeImage:true});return}alert('Gerador de PDF indisponível.')}catch(e){console.error(e);alert('Não foi possível gerar o PDF.')}}
async function batchPdf(){const items=read().filter(i=>selected.has(String(i.id))&&isPending(i));if(!items.length)return alert('Selecione pelo menos um transporte.');if(!window.HeuroPdf?.build||!window.HeuroPdf?.drawPage)return alert('O gerador de PDF em lote não está disponível nesta versão.');const btn=$('generateSelectedPendingPdf'),old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='Gerando PDFs...'}try{const doc=await window.HeuroPdf.build(items[0],{includeImage:true});for(let n=1;n<items.length;n++){doc.addPage();window.HeuroPdf.drawPage(doc,items[n])}doc.save(`Pendências de transporte HEURO - ${dmy(new Date().toISOString().slice(0,10))}.pdf`)}catch(e){console.error(e);alert('Não foi possível gerar os PDFs selecionados.')}finally{if(btn){btn.disabled=selected.size===0;btn.textContent=old||'Gerar PDFs dos transportes'}}}
async function loadJsPdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});return window.jspdf?.jsPDF}
async function tablePdf(){
 const items=read().filter(i=>selected.has(String(i.id))&&isPending(i));if(!items.length)return alert('Selecione pelo menos um transporte.');
 const btn=$('generateSelectedPendingTablePdf'),old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='Gerando planilha...'}
 try{
  const jsPDF=await loadJsPdf();if(!jsPDF)throw new Error('jsPDF indisponível');
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
  const columns=[['Protocolo',22],['Solicitado',27],['Aceite',27],['Paciente',30],['Origem',38],['Destino',32],['Agendado',28],['Status',27],['Solicitado por',28],['Aceito por',28]];
  const margin=4,total=columns.reduce((s,c)=>s+c[1],0),pageH=210;
  const drawHeader=()=>{doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('TRANSPORTES HEURO — PLANILHA DE PENDÊNCIAS SELECIONADAS',148.5,10,{align:'center'});doc.setFontSize(7);doc.setFillColor(225,238,250);let x=margin;columns.forEach(([name,w])=>{doc.rect(x,15,w,9,'F');doc.text(name,x+w/2,20.5,{align:'center',maxWidth:w-2});x+=w});return 24};
  let y=drawHeader();doc.setFont('helvetica','normal');doc.setFontSize(6.2);
  for(const i of items){const values=[i.protocol||'—',dt(i.createdAt),dt(i.acceptedAt),i.patient||'Paciente',origin(i),i.destination||'Não informado',scheduled(i),i.status==='Aceito'?'Aceito / Em andamento':'Solicitado',i.requester||'Não informado',i.executor||'—'];const lines=values.map((v,n)=>doc.splitTextToSize(String(v),columns[n][1]-2));const h=Math.max(9,...lines.map(l=>l.length*3+3));if(y+h>pageH-6){doc.addPage();y=drawHeader();doc.setFont('helvetica','normal');doc.setFontSize(6.2)}let x=margin;const accepted=i.status==='Aceito';doc.setFillColor(...(accepted?[234,248,239]:[255,245,232]));columns.forEach(([,w],n)=>{doc.rect(x,y,w,h,'F');doc.setDrawColor(185,212,237);doc.rect(x,y,w,h);doc.setTextColor(23,50,79);doc.text(lines[n],x+1,y+4);x+=w});y+=h}
  doc.save(`Planilha de pendências selecionadas - ${dmy(new Date().toISOString().slice(0,10))}.pdf`)
 }catch(e){console.error(e);alert('Não foi possível gerar o PDF da planilha selecionada.')}finally{if(btn){btn.disabled=selected.size===0;btn.textContent=old||'Gerar planilha selecionada'}}
}
document.addEventListener('heuro:open-pending-sheet',e=>{selectedId=e.detail?.requestId||'';selected.clear();render()});
document.addEventListener('change',e=>{const c=e.target.closest('[data-select-id]');if(!c)return;const id=String(c.dataset.selectId);if(c.checked)selected.add(id);else selected.delete(id);updateSelectionUi()},true);
document.addEventListener('click',e=>{
 if(e.target.closest('#pendingSheetBack')){e.preventDefault();show('pendingNew');return}
 if(e.target.closest('#selectAllPending')){e.preventDefault();document.querySelectorAll('[data-select-id]').forEach(c=>{c.checked=true;selected.add(String(c.dataset.selectId))});updateSelectionUi();return}
 if(e.target.closest('#clearPendingSelection')){e.preventDefault();selected.clear();document.querySelectorAll('[data-select-id]').forEach(c=>c.checked=false);updateSelectionUi();return}
 if(e.target.closest('#generateSelectedPendingPdf')){e.preventDefault();batchPdf();return}
 if(e.target.closest('#generateSelectedPendingTablePdf')){e.preventDefault();tablePdf();return}
 const p=e.target.closest('[data-pdf-id]');if(p){e.preventDefault();pdf(p.dataset.pdfId)}
},true);
})();