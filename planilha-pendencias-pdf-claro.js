(()=>{
'use strict';
const read=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
const pad=n=>String(n).padStart(2,'0');
const dt=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`};
const dmy=v=>{if(!v)return'—';const[y,m,d]=String(v).split('-');return y&&m&&d?`${d}/${m}/${y}`:'—'};
const scheduled=i=>i.transportDate&&i.transportTime?`${dmy(i.transportDate)} - ${i.transportTime}`:'—';
const origin=i=>i.boxNumber?`${i.originSector||'Não informada'} - Box ${i.boxNumber}`:`${i.originSector||'Não informada'} - ${i.ward||'Enfermaria não informada'} / Leito ${i.bed||'não informado'}`;
async function loadJsPdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});return window.jspdf?.jsPDF}
function renameButton(){const old=document.getElementById('generateSelectedPendingTablePdf');if(old){old.id='generateSelectedPendingTablePdfClaro';old.textContent='Gerar planilha selecionada'}}
new MutationObserver(renameButton).observe(document.documentElement,{subtree:true,childList:true});
renameButton();
async function generate(){
 const ids=[...document.querySelectorAll('#pendingSheetNew [data-select-id]:checked')].map(el=>String(el.dataset.selectId));
 const items=read().filter(i=>ids.includes(String(i.id))&&['Solicitado','Aceito'].includes(i.status));
 if(!items.length)return alert('Selecione pelo menos um transporte.');
 const btn=document.getElementById('generateSelectedPendingTablePdfClaro');const old=btn?.textContent;
 if(btn){btn.disabled=true;btn.textContent='Gerando planilha...'}
 try{
  const jsPDF=await loadJsPdf();if(!jsPDF)throw new Error('jsPDF indisponível');
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
  const pageW=297,pageH=210,margin=6;
  const cols=[['Protocolo',24],['Solicitado',29],['Aceite',29],['Paciente',31],['Origem',39],['Destino',30],['Agendado',29],['Status',29],['Solicitado por',31],['Aceito por',31]];
  const drawHeader=()=>{
   doc.setFillColor(255,255,255);doc.rect(0,0,pageW,pageH,'F');
   doc.setTextColor(13,63,134);doc.setFont('helvetica','bold');doc.setFontSize(13);
   doc.text('TRANSPORTES HEURO',pageW/2,10,{align:'center'});
   doc.setTextColor(35,59,94);doc.setFontSize(9);
   doc.text('PLANILHA DE PENDÊNCIAS SELECIONADAS',pageW/2,15,{align:'center'});
   let x=margin;doc.setFontSize(6.5);
   for(const [name,w] of cols){
    doc.setFillColor(232,242,252);doc.setDrawColor(157,197,234);doc.setLineWidth(.2);doc.rect(x,19,w,10,'FD');
    doc.setTextColor(23,50,79);doc.text(name,x+w/2,25,{align:'center',maxWidth:w-2});x+=w;
   }
   return 29;
  };
  let y=drawHeader();
  for(const i of items){
   const values=[i.protocol||'—',dt(i.createdAt),dt(i.acceptedAt),i.patient||'Paciente',origin(i),i.destination||'Não informado',scheduled(i),i.status==='Aceito'?'Aceito / Em andamento':'Solicitado',i.requester||'Não informado',i.executor||'—'];
   doc.setFont('helvetica','normal');doc.setFontSize(6.2);
   const lines=values.map((v,n)=>doc.splitTextToSize(String(v),cols[n][1]-2));
   const h=Math.max(10,...lines.map(l=>l.length*3.1+3));
   if(y+h>pageH-7){doc.addPage();y=drawHeader()}
   let x=margin;const accepted=i.status==='Aceito';
   for(let n=0;n<cols.length;n++){
    const w=cols[n][1];
    if(accepted)doc.setFillColor(239,250,243);else doc.setFillColor(255,248,239);
    doc.setDrawColor(185,212,237);doc.setLineWidth(.2);doc.rect(x,y,w,h,'FD');
    doc.setTextColor(25,43,68);doc.text(lines[n],x+1.2,y+4.2,{maxWidth:w-2.4});x+=w;
   }
   y+=h;
  }
  doc.save(`Planilha de pendências selecionadas - ${dmy(new Date().toISOString().slice(0,10))}.pdf`);
 }catch(e){console.error(e);alert('Não foi possível gerar o PDF da planilha selecionada.')}finally{if(btn){btn.disabled=false;btn.textContent=old||'Gerar planilha selecionada'}}
}
document.addEventListener('click',e=>{const b=e.target.closest('#generateSelectedPendingTablePdfClaro');if(!b)return;e.preventDefault();e.stopImmediatePropagation();generate()},true);
})();