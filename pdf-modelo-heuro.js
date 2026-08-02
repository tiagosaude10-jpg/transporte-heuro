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
 ['clipboard','Protocolo',item.protocol||'—'],['list','Status',item.status||'Solicitado'],['person','Paciente',item.patient||'Não informado'],['hospital','Origem',origin(item)],['pin','Destino',item.destination||'Não informado'],['calendar','Horário agendado',scheduled(item)],['clock','Solicitado',formatIso(item.createdAt)],['check','Aceite',formatIso(item.acceptedAt)],['finish','Conclusão',formatIso(item.completedAt)],['ambulance','Ambulância',item.ambulanceType||'Não informada'],['alert','Prioridade',item.priority||'Não informada'],['person','Solicitante',item.requester||'Não informado'],['person','Executante',item.executor||'Não definido'],['message','Observações',item.notes||'Sem observações']
]}
function icon(doc,type,x,y){doc.setDrawColor(12,36,77);doc.setLineWidth(.55);const c=(a,b,r)=>doc.circle(a,b,r);const l=(a,b,d,e)=>doc.line(a,b,d,e);const r=(a,b,w,h)=>doc.rect(a,b,w,h);
 if(type==='clipboard'){r(x-3,y-3,6,7);r(x-1.5,y-4.2,3,1.5);c(x,y,0.35);c(x,y+2,0.35)}
 else if(type==='list'){c(x-2.5,y-2,0.35);c(x-2.5,y,0.35);c(x-2.5,y+2,0.35);l(x-1.3,y-2,x+3,y-2);l(x-1.3,y,x+3,y);l(x-1.3,y+2,x+3,y+2)}
 else if(type==='person'){c(x,y-2.2,1.7);doc.ellipse(x,y+2.2,3.1,2.6,'S')}
 else if(type==='hospital'){r(x-3.5,y-3,7,7);r(x-1,y+1,2,3);l(x,y-2,x,y);l(x-1,y-1,x+1,y-1)}
 else if(type==='pin'){c(x,y-1.5,2.5);c(x,y-1.5,.7);l(x-1.5,y+.5,x,y+3.5);l(x+1.5,y+.5,x,y+3.5)}
 else if(type==='calendar'){r(x-3.5,y-3,7,6.5);l(x-3.5,y-1,x+3.5,y-1);l(x-2,y-4,x-2,y-2);l(x+2,y-4,x+2,y-2)}
 else if(type==='clock'){c(x,y,3.4);l(x,y,x,y-2);l(x,y,x+1.8,y+1)}
 else if(type==='check'){c(x,y,3.4);l(x-1.8,y,x-.5,y+1.5);l(x-.5,y+1.5,x+2.2,y-1.5)}
 else if(type==='finish'){r(x-3,y-3,6,6);l(x-1.8,y,x-.5,y+1.4);l(x-.5,y+1.4,x+2,y-1.5)}
 else if(type==='ambulance'){r(x-3.8,y-2.2,5.3,4);r(x+1.5,y-.8,2.5,2.6);c(x-2.3,y+2.2,.9);c(x+2.7,y+2.2,.9);l(x-1.2,y-1,x-1.2,y+1);l(x-2.2,y,x-.2,y)}
 else if(type==='alert'){l(x,y-3.7,x-3.4,y+3);l(x-3.4,y+3,x+3.4,y+3);l(x+3.4,y+3,x,y-3.7);l(x,y-1.8,x,y+1);c(x,y+2.1,.25)}
 else if(type==='message'){doc.roundedRect(x-3.5,y-2.8,7,5.2,1,1,'S');l(x-1.8,y+2.4,x-2.8,y+3.8);l(x-2.8,y+3.8,x-.5,y+2.4)}
}
function drawPage(doc,item){doc.setTextColor(12,36,77);doc.setFont('helvetica','bold');doc.setFontSize(24);doc.text('TRANSPORTE HEURO',105,18,{align:'center'});doc.setDrawColor(12,36,77);doc.setLineWidth(.9);doc.line(38,25,172,25);let y=37;for(const[type,label,value]of rows(item)){const lines=doc.splitTextToSize(String(value),118);const h=Math.max(13,lines.length*6.2+7);doc.setDrawColor(226,229,234);doc.setLineWidth(.25);doc.line(10,y+h-2,200,y+h-2);icon(doc,type,17,y+3);doc.setTextColor(0,0,0);doc.setFont('helvetica','bold');doc.setFontSize(13.5);doc.text(`${label}:`,28,y+5);doc.setFont('helvetica','normal');doc.setFontSize(13.5);doc.text(lines,78,y+5);y+=h}}
async function addAttachment(doc,item){const att=await getAttachment(item.id);if(!att?.blob||!String(att.type||'').startsWith('image/'))return;const src=await toDataUrl(att.blob);const img=await new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=src});doc.addPage();doc.setTextColor(12,36,77);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('DOCUMENTO DA REGULAÇÃO',105,18,{align:'center'});doc.setDrawColor(12,36,77);doc.line(45,23,165,23);const ratio=Math.min(180/img.naturalWidth,255/img.naturalHeight);const w=img.naturalWidth*ratio,h=img.naturalHeight*ratio;doc.addImage(src,String(att.type).includes('png')?'PNG':'JPEG',(210-w)/2,29,w,h)}
async function build(item,{includeImage=true}={}){await loadPdf();const{jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4',compress:true});drawPage(doc,item);if(includeImage)await addAttachment(doc,item);return doc}
window.HeuroPdf={build,drawPage,formatIso,scheduled};
})();