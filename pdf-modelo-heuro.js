(()=>{
'use strict';
const DB='heuroTransportFiles',STORE='attachments';
const pad=n=>String(n).padStart(2,'0');
const formatIso=value=>{if(!value)return'—';const d=new Date(value);if(Number.isNaN(d.getTime()))return'—';return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`};
const formatDate=value=>{if(!value)return'—';const[y,m,d]=String(value).split('-');return y&&m&&d?`${d}/${m}/${y}`:String(value)};
const scheduled=item=>`${formatDate(item.transportDate)} - ${item.transportTime||'—'}`;
const origin=item=>item.boxNumber?`${item.originSector||'Não informada'} - Box ${item.boxNumber}`:`${item.originSector||'Não informada'} - ${item.ward||'Enfermaria não informada'} / Leito ${item.bed||'não informado'}`;
function openDb(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function getAttachment(id){const db=await openDb();const out=await new Promise((ok,no)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(id);r.onsuccess=()=>ok(r.result||null);r.onerror=()=>no(r.error)});db.close();return out}
const toDataUrl=blob=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(blob)});
async function loadPdf(){if(window.jspdf?.jsPDF)return;await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function rows(item){return[
 ['P','Protocolo',item.protocol||'—'],
 ['S','Status',item.status||'Solicitado'],
 ['P','Paciente',item.patient||'Não informado'],
 ['O','Origem',origin(item)],
 ['D','Destino',item.destination||'Não informado'],
 ['H','Horário agendado',scheduled(item)],
 ['S','Solicitado',formatIso(item.createdAt)],
 ['A','Aceite',formatIso(item.acceptedAt)],
 ['C','Conclusão',formatIso(item.completedAt)],
 ['M','Ambulância',item.ambulanceType||'Não informada'],
 ['!','Prioridade',item.priority||'Não informada'],
 ['S','Solicitante',item.requester||'Não informado'],
 ['E','Executante',item.executor||'Não definido'],
 ['O','Observações',item.notes||'Sem observações']
]}
function drawPage(doc,item){
 doc.setTextColor(12,36,77);doc.setFont('helvetica','bold');doc.setFontSize(24);doc.text('TRANSPORTE HEURO',105,18,{align:'center'});doc.setDrawColor(12,36,77);doc.setLineWidth(.9);doc.line(38,25,172,25);
 let y=37;for(const[icon,label,value]of rows(item)){
  const lines=doc.splitTextToSize(String(value),118);const h=Math.max(13,lines.length*6.2+7);
  doc.setDrawColor(226,229,234);doc.setLineWidth(.25);doc.line(10,y+h-2,200,y+h-2);
  doc.setDrawColor(12,36,77);doc.setLineWidth(.55);doc.circle(17,y+3.5,3.7);doc.setTextColor(12,36,77);doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.text(icon,17,y+4.5,{align:'center'});
  doc.setTextColor(0,0,0);doc.setFont('helvetica','bold');doc.setFontSize(13.5);doc.text(`${label}:`,28,y+5);
  doc.setFont('helvetica','normal');doc.setFontSize(13.5);doc.text(lines,78,y+5);
  y+=h;
 }
}
async function addAttachment(doc,item){const att=await getAttachment(item.id);if(!att?.blob||!String(att.type||'').startsWith('image/'))return;const src=await toDataUrl(att.blob);const img=await new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=src});doc.addPage();doc.setTextColor(12,36,77);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('DOCUMENTO DA REGULAÇÃO',105,18,{align:'center'});doc.setDrawColor(12,36,77);doc.line(45,23,165,23);const ratio=Math.min(180/img.naturalWidth,255/img.naturalHeight);const w=img.naturalWidth*ratio,h=img.naturalHeight*ratio;doc.addImage(src,String(att.type).includes('png')?'PNG':'JPEG',(210-w)/2,29,w,h)}
async function build(item,{includeImage=true}={}){await loadPdf();const{jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4',compress:true});drawPage(doc,item);if(includeImage)await addAttachment(doc,item);return doc}
window.HeuroPdf={build,drawPage,formatIso,scheduled};
})();