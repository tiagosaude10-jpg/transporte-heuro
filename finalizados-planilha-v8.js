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
function removeLegacyActions(){document.getElementById('finalizedPdfActions')?.remove()}
function row(i){return `<tr>
<td>${esc(i.protocol||'—')}</td><td>${esc(formatDateTime(i.createdAt))}</td><td>${esc(formatDateTime(i.acceptedAt))}</td><td>${esc(formatDateTime(i.completedAt))}</td><td>${esc(i.patient||'Paciente não informado')}</td><td>${esc(origin(i))}</td><td>${esc(i.destination||'Não informado')}</td><td>${esc(scheduled(i))}</td><td><strong>${esc(i.status||'Concluído')}</strong></td><td>${esc(i.requester||'Não informado')}</td><td>${esc(i.executor||'Não informado')}</td><td>${esc(i.ambulanceType||'Não informada')}</td><td>${esc(i.priority||'Não informada')}</td><td><button class="finalized-item-pdf" data-id="${esc(i.id)}" type="button">Gerar PDF</button></td>
</tr>`}
function render(date=today()){
 const box=$('teamListNew');if(!box)return;
 const data=finalized(date);
 const heads=['Protocolo','Solicitado','Aceite','Conclusão','Paciente','Origem','Destino','Horário agendado','Status','Solicitante','Executante','Ambulância','Prioridade','PDF'];
 box.innerHTML=`<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px"><button id="backTeamMenu" class="back" type="button">Voltar</button><strong>Transportes finalizados</strong></div>
 <div class="card" style="padding:16px;margin-bottom:14px"><label style="display:block;font-weight:800;color:#243b64;margin-bottom:8px">Consultar outro dia</label><div style="display:grid;grid-template-columns:1fr auto;gap:10px"><input id="finalizedDate" type="date" value="${esc(date)}" style="min-height:48px;border:1px solid #cdd9e5;border-radius:12px;padding:0 12px;font-size:16px"><button id="searchFinalizedDateV8" type="button" style="border:0;border-radius:12px;padding:0 18px;background:#5b3f82;color:#fff;font-weight:800">Visualizar</button></div></div>
 <div style="margin-bottom:10px;color:#60738a"><strong style="color:#243b64">Planilha de ${date===today()?'hoje':formatDate(date)}</strong> — ${data.length} transporte(s)</div>
 <div style="overflow-x:auto;background:#fff;border-radius:16px;border:1px solid #dbe5ef"><table style="width:100%;border-collapse:collapse;min-width:2200px"><thead><tr style="background:#f3eef9">${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${data.map(row).join('')||'<tr><td colspan="14" style="padding:22px;text-align:center">Nenhum transporte finalizado nesta data.</td></tr>'}</tbody></table></div>
 <style>#teamListNew th,#teamListNew td{padding:11px;text-align:center;vertical-align:middle;border-bottom:1px solid #cfe0f2;white-space:nowrap}.finalized-item-pdf{border:0;border-radius:10px;padding:10px 13px;background:#243b64;color:#fff;font-weight:800}</style>`;
 removeLegacyActions();setTimeout(removeLegacyActions,50);setTimeout(removeLegacyActions,250)
}
async function makePdf(id){const item=read().find(i=>i.id===id);if(!item)return alert('Transporte não encontrado.');try{if(window.HeuroPdf?.build){const doc=await window.HeuroPdf.build(item,{includeImage:false});doc.save(`Transporte HEURO - ${item.protocol||item.id}.pdf`);return}if(window.pdfSolicitacaoModelo?.gerar){await window.pdfSolicitacaoModelo.gerar(item,{includeImage:false});return}alert('O gerador de PDF não está disponível nesta versão.')}catch(e){console.error(e);alert('Não foi possível gerar o PDF deste transporte.')}
}
document.addEventListener('click',e=>{
 const open=e.target.closest('#openFinalizedTeam');if(open){e.preventDefault();e.stopImmediatePropagation();render(today());return}
 const search=e.target.closest('#searchFinalizedDateV8');if(search){e.preventDefault();e.stopImmediatePropagation();render($('finalizedDate')?.value||today());return}
 const pdf=e.target.closest('.finalized-item-pdf');if(pdf){e.preventDefault();e.stopImmediatePropagation();makePdf(pdf.dataset.id);return}
},true);
new MutationObserver(removeLegacyActions).observe(document.documentElement,{subtree:true,childList:true});
})();