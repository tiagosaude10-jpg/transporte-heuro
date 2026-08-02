(()=>{
'use strict';
const read=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
const pad=n=>String(n).padStart(2,'0');
const dt=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`};
const dmy=v=>{if(!v)return'—';const[y,m,d]=String(v).split('-');return y&&m&&d?`${d}/${m}/${y}`:'—'};
const scheduled=i=>i.transportDate&&i.transportTime?`${dmy(i.transportDate)} ${i.transportTime}`:'—';
const origin=i=>i.boxNumber?`${i.originSector||'Não informada'} - Box ${i.boxNumber}`:`${i.originSector||'Não informada'} - ${i.ward||'Enfermaria não informada'} / Leito ${i.bed||'não informado'}`;
async function loadJsPdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});return window.jspdf?.jsPDF}
function selectedCount(){return document.querySelectorAll('#pendingSheetNew [data-select-id]:checked').length}
function syncButton(){const old=document.getElementById('generateSelectedPendingTablePdf');if(old){old.id='generateSelectedPendingTablePdfClaro';old.textContent='Gerar planilha selecionada'}const btn=document.getElementById('generateSelectedPendingTablePdfClaro');if(btn)btn.disabled=selectedCount()===0}
new MutationObserver(syncButton).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('change',e=>{if(e.target.closest('#pendingSheetNew [data-select-id]'))setTimeout(syncButton,0)},true);
document.addEventListener('click',e=>{if(e.target.closest('#selectAllPending,#clearPendingSelection'))setTimeout(syncButton,0)},true);
syncButton();
async function generate(){
 const ids=[...document.querySelectorAll('#pendingSheetNew [data-select-id]:checked')].map(el=>String(el.dataset.selectId));
 const items=read().filter(i=>ids.includes(String(i.id))&&['Solicitado','Aceito'].includes(i.status));
 if(!items.length)return alert('Selecione pelo menos um transporte.');
 const btn=document.getElementById('generateSelectedPendingTablePdfClaro');const old=btn?.textContent;
 if(btn){btn.disabled=true;btn.textContent='Gerando planilha...'}
 try{
  const jsPDF=await loadJsPdf();if(!jsPDF)throw new Error('jsPDF indisponível');
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
  const pageW=doc.internal.pageSize.getWidth(),pageH=doc.internal.pageSize.getHeight();
  const margin=5,usableW=pageW-(margin*2);
  const base=[24,24,24,27,33,27,25,25,25,25];
  const totalBase=base.reduce((a,b)=>a+b,0);
  const widths=base.map(w=>w*usableW/totalBase);
  const labels=['Protocolo','Solicitado','Aceite','Paciente','Origem','Destino','Agendado','Status','Solicitado por','Aceito por'];
  const cols=labels.map((name,n)=>[name,widths[n]]);
  const drawHeader=()=>{
   doc.setFillColor(255,255,255);doc.rect(0,0,pageW,pageH,'F');
   doc.setTextColor(13,63,134);doc.setFont('helvetica','bold');doc.setFontSize(12);
   doc.text('TRANSPORTES HEURO',pageW/2,8,{align:'center'});
   doc.setTextColor(35,59,94);doc.setFontSize(8);
   doc.text('PLANILHA DE PENDÊNCIAS SELECIONADAS',pageW/2,13,{align:'center'});
   let x=margin;doc.setFontSize(5.8);
   for(const [name,w] of cols){doc.setFillColor(232,242,252);doc.setDrawColor(157,197,234);doc.setLineWidth(.18);doc.rect(x,16,w,8,'FD');doc.setTextColor(23,50,79);const hl=doc.splitTextToSize(name,w-1.4);doc.text(hl,x+w/2,19.5,{align:'center',maxWidth:w-1.4});x+=w}
   return 24;
  };
  let y=drawHeader();
  for(const i of items){
   const values=[i.protocol||'—',dt(i.createdAt),dt(i.acceptedAt),i.patient||'Paciente',origin(i),i.destination||'Não informado',scheduled(i),i.status==='Aceito'?'Aceito / Em andamento':'Solicitado',i.requester||'Não informado',i.executor||'—'];
   doc.setFont('helvetica','normal');doc.setFontSize(5.6);
   const lines=values.map((v,n)=>doc.splitTextToSize(String(v),cols[n][1]-1.8));
   const h=Math.max(8,...lines.map(l=>l.length*2.7+2.8));
   if(y+h>pageH-5){doc.addPage();y=drawHeader();doc.setFont('helvetica','normal');doc.setFontSize(5.6)}
   let x=margin;const accepted=i.status==='Aceito';
   for(let n=0;n<cols.length;n++){
    const w=cols[n][1];
    doc.setFillColor(...(accepted?[239,250,243]:[255,248,239]));
    doc.setDrawColor(185,212,237);doc.setLineWidth(.18);doc.rect(x,y,w,h,'FD');
    doc.setTextColor(25,43,68);doc.text(lines[n],x+.9,y+3.5,{maxWidth:w-1.8});x+=w;
   }
   y+=h;
  }
  doc.save(`Planilha de pendências selecionadas - ${dmy(new Date().toISOString().slice(0,10))}.pdf`);
 }catch(e){console.error(e);alert('Não foi possível gerar o PDF da planilha selecionada.')}finally{if(btn){btn.textContent=old||'Gerar planilha selecionada';btn.disabled=selectedCount()===0}}
}
document.addEventListener('click',e=>{const b=e.target.closest('#generateSelectedPendingTablePdfClaro');if(!b)return;e.preventDefault();e.stopImmediatePropagation();generate()},true);
})();