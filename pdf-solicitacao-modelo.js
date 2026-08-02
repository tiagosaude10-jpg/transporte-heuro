(()=>{
'use strict';
const read=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
const digits=v=>String(v||'').replace(/\D/g,'');
const withBrazil=v=>{const n=digits(v);return n.startsWith('55')?n:`55${n}`};
const isUti=item=>String(item.ambulanceType||'').trim().toLowerCase()==='uti';
const numberFor=item=>isUti(item)?localStorage.getItem('heuroWhatsappUti')||'':localStorage.getItem('heuroWhatsappBasic')||localStorage.getItem('heuroWhatsapp')||'';
async function blob(item){if(!window.HeuroPdf?.build)throw new Error('Modelo do PDF indisponível');const doc=await window.HeuroPdf.build(item,{includeImage:true});return doc.output('blob')}
function download(fileBlob,name){const url=URL.createObjectURL(fileBlob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1800)}
async function share(item,fileBlob,name){const file=new File([fileBlob],name,{type:'application/pdf'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:`Transporte HEURO - ${item.protocol}`,text:`Solicitação de transporte ${item.protocol}.`,files:[file]});return}download(fileBlob,name);const number=numberFor(item);if(number)window.open(`https://wa.me/${withBrazil(number)}`,'_blank')}
window.addEventListener('click',async e=>{const send=e.target.closest('#sendWhatsappNew');const down=e.target.closest('#downloadPdfNew');if(!send&&!down)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const item=read()[0];if(!item){alert('Nenhuma solicitação encontrada.');return}const btn=send||down;const old=btn.textContent;btn.disabled=true;btn.textContent='Gerando PDF...';try{const out=await blob(item);const name=`Transporte HEURO - ${item.protocol}.pdf`;if(send)await share(item,out,name);else download(out,name)}catch(err){console.error(err);alert(err?.message||'Não foi possível gerar o PDF.')}finally{btn.disabled=false;btn.textContent=old}},true);
})();