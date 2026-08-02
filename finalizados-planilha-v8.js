(()=>{
'use strict';
const $=id=>document.getElementById(id);
const read=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const localDate=v=>{const d=new Date(v);if(Number.isNaN(d.getTime()))return'';return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
const today=()=>localDate(new Date());
const formatDate=v=>{if(!v)return'—';const [y,m,d]=String(v).split('-');return y&&m&&d?`${d}/${m}/${y}`:'—'};
const formatDateTime=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`};
const scheduled=i=>i.transportDate&&i.transportTime?`${formatDate(i.transportDate)} - ${i.transportTime}`:'—';
const origin=i=>i.boxNumber?`${i.originSector||'Não informada'} - Box ${i.boxNumber}`:`${i.originSector||'Não informada'} - ${i.ward||'Enfermaria não informada'} / Leito ${i.bed||'não informado'}`;
const finalized=date=>read().filter(i=>i.status==='Concluído'&&localDate(i.completedAt||i.transportDate)===date).sort((a,b)=>new Date(a.completedAt||0)-new Date(b.completedAt||0));
let selected=new Set();
function removeLegacyActions(){document.getElementById('finalizedPdfActions')?.remove()}
function row(i){return `<tr>
<td><input class="finalized-select" data-id="${esc(i.id)}" type="checkbox" ${selected.has(String(i.id))?'checked':''} aria-label="Selecionar ${esc(i.patient||'transporte')}"></td><td>${esc(i.protocol||'—')}</td><td>${esc(formatDateTime(i.createdAt))}</td><td>${esc(formatDateTime(i.acceptedAt))}</td><td>${esc(formatDateTime(i.completedAt))}</td><td>${esc(i.patient||'Paciente não informado')}</td><td>${esc(origin(i))}</td><td>${esc(i.destination||'Não informado')}</td><td>${esc(scheduled(i))}</td><td><strong>${esc(i.status||'Concluído')}</strong></td><td>${esc(i.requester||'Não informado')}</td><td>${esc(i.executor||'—')}</td><td>${esc(i.completedBy||'—')}</td><td>${esc(i.ambulanceType||'Não informada')}</td><td>${esc(i.priority||'Não informada')}</td><td><button class="finalized-item-pdf" data-id="${esc(i.id)}" type="button">Gerar PDF</button></td>
</tr>`}
function updateCounter(){const el=$('selectedFinalizedCount');if(el)el.textContent=`${selected.size} transporte(s) selecionado(s)`;const btn=$('generateSelectedFinalizedPdf');if(btn)btn.disabled=selected.size===0}
function render(date=today()){
 const box=$('teamListNew');if(!box)return;
 const data=finalized(date);const visibleIds=new Set(data.map(i=>String(i.id)));selected=new Set([...selected].filter(id=>visibleIds.has(id)));
 const heads=['Selecionar','Protocolo','Solicitado','Aceite','Conclusão','Paciente','Origem','Destino','Horário agendado','Status','Solicitado por','Aceito por','Concluído por','Ambulância','Prioridade','PDF'];
 box.innerHTML=`<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px"><button id="backTeamMenu" class="back" type="button">Voltar</button><strong>Transportes finalizados</strong></div>
 <div class="card" style="padding:16px;margin-bottom:14px"><label style="display:block;font-weight:800;color:#243b64;margin-bottom:8px">Consultar outro dia</label><div style="display:grid;grid-template-columns:1fr auto;gap:10px"><input id="finalizedDate" type="date" value="${esc(date)}" style="min-height:48px;border:1px solid #cdd9e5;border-radius:12px;padding:0 12px;font-size:16px"><button id="searchFinalizedDateV8" type="button" style="border:0;border-radius:12px;padding:0 18px;background:#5b3f82;color:#fff;font-weight:800">Visualizar</button></div></div>
 <div class="card" style="padding:14px;margin-bottom:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center"><button id="selectAllFinalized" type="button" class="finalized-batch secondary">Selecionar todos</button><button id="clearFinalizedSelection" type="button" class="finalized-batch secondary">Limpar seleção</button><button id="generateSelectedFinalizedPdf" type="button" class="finalized-batch primary" ${selected.size?'':'disabled'}>Gerar PDF dos selecionados</button><strong id="selectedFinalizedCount" style="color:#243b64">${selected.size} transporte(s) selecionado(s)</strong></div>
 <div style="margin-bottom:10px;color:#60738a"><strong style="color:#243b64">Planilha de ${date===today()?'hoje':formatDate(date)}</strong> — ${data.length} transporte(s)</div>
 <div style="overflow-x:auto;background:#fff;border-radius:16px;border:1px solid #dbe5ef"><table style="width:100%;border-collapse:collapse;min-width:2460px"><thead><tr style="background:#f3eef9">${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${data.map(row).join('')||'<tr><td colspan="16" style="padding:22px;text-align:center">Nenhum transporte finalizado nesta data.</td></tr>'}</tbody></table></div>
 <style>#teamListNew th,#teamListNew td{padding:11px;text-align:center;vertical-align:middle;border-bottom:1px solid #cfe0f2;white-space:nowrap}.finalized-item-pdf{border:0;border-radius:10px;padding:10px 13px;background:#243b64;color:#fff;font-weight:800}.finalized-select{width:22px;height:22px;accent-color:#5b3f82}.finalized-batch{min-height:44px;border:0;border-radius:11px;padding:0 14px;font-weight:800}.finalized-batch.secondary{background:#e8eef8;color:#243b64}.finalized-batch.primary{background:#5b3f82;color:#fff}.finalized-batch:disabled{opacity:.45}</style>`;
 removeLegacyActions();setTimeout(removeLegacyActions,50);setTimeout(removeLegacyActions,250)
}
async function makePdf(id){const item=read().find(i=>String(i.id)===String(id));if(!item)return alert('Transporte não encontrado.');try{if(window.HeuroPdf?.build){const doc=await window.HeuroPdf.build(item,{includeImage:false});doc.save(`Transporte HEURO - ${item.protocol||item.id}.pdf`);return}if(window.pdfSolicitacaoModelo?.gerar){await window.pdfSolicitacaoModelo.gerar(item,{includeImage:false});return}alert('O gerador de PDF não está disponível nesta versão.')}catch(e){console.error(e);alert('Não foi possível gerar o PDF deste transporte.')}
}
async function makeBatchPdf(ids){const items=read().filter(i=>ids.includes(String(i.id)));if(!items.length)return alert('Selecione pelo menos um transporte.');if(!window.HeuroPdf?.build||!window.HeuroPdf?.drawPage)return alert('O gerador de PDF em lote não está disponível nesta versão.');const btn=$('generateSelectedFinalizedPdf');const old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='Gerando PDF...'}try{const doc=await window.HeuroPdf.build(items[0],{includeImage:false});for(let i=1;i<items.length;i++){doc.addPage();window.HeuroPdf.drawPage(doc,items[i])}const date=$('finalizedDate')?.value||today();doc.save(`Transportes finalizados - ${date}.pdf`)}catch(e){console.error(e);alert('Não foi possível gerar o PDF dos transportes selecionados.')}finally{if(btn){btn.disabled=selected.size===0;btn.textContent=old||'Gerar PDF dos selecionados'}}}
document.addEventListener('change',e=>{const check=e.target.closest('.finalized-select');if(!check)return;const id=String(check.dataset.id);if(check.checked)selected.add(id);else selected.delete(id);updateCounter()},true);
document.addEventListener('click',e=>{
 const open=e.target.closest('#openFinalizedTeam');if(open){e.preventDefault();e.stopImmediatePropagation();selected.clear();render(today());return}
 const search=e.target.closest('#searchFinalizedDateV8');if(search){e.preventDefault();e.stopImmediatePropagation();selected.clear();render($('finalizedDate')?.value||today());return}
 const all=e.target.closest('#selectAllFinalized');if(all){e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('.finalized-select').forEach(c=>{c.checked=true;selected.add(String(c.dataset.id))});updateCounter();return}
 const clear=e.target.closest('#clearFinalizedSelection');if(clear){e.preventDefault();e.stopImmediatePropagation();selected.clear();document.querySelectorAll('.finalized-select').forEach(c=>c.checked=false);updateCounter();return}
 const batch=e.target.closest('#generateSelectedFinalizedPdf');if(batch){e.preventDefault();e.stopImmediatePropagation();makeBatchPdf([...selected]);return}
 const pdf=e.target.closest('.finalized-item-pdf');if(pdf){e.preventDefault();e.stopImmediatePropagation();makePdf(pdf.dataset.id);return}
},true);
new MutationObserver(removeLegacyActions).observe(document.documentElement,{subtree:true,childList:true});
})();