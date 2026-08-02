(()=>{
'use strict';
const read=()=>{try{return JSON.parse(localStorage.getItem('heuroRequests')||'[]')}catch{return[]}};
async function generate(item){if(!window.HeuroPdf?.build)throw new Error('Modelo do PDF indisponível');const doc=await window.HeuroPdf.build(item,{includeImage:true});doc.save(`Transporte HEURO - ${item.protocol}.pdf`)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pdf-image]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const item=read().find(x=>x.id===b.dataset.id);if(!item)return;generate(item).catch(err=>{console.error(err);alert('Não foi possível gerar o PDF.')})},true);
})();