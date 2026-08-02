(()=>{
'use strict';
if(window.__heuroProtocolPatch)return;window.__heuroProtocolPatch=true;
const original=Storage.prototype.setItem;
const two=n=>String(n).padStart(2,'0');
const makeProtocol=value=>{const d=new Date(value||Date.now());return `HEURO${two(d.getDate())}${two(d.getMonth()+1)}${d.getFullYear()}${two(d.getHours())}${two(d.getMinutes())}${two(d.getSeconds())}`};
Storage.prototype.setItem=function(key,value){
  if(this===localStorage&&key==='heuroRequests'){
    try{
      const before=JSON.parse(original.call(localStorage,'heuroRequests')||'[]');
      const known=new Set(before.map(x=>x.id));
      const data=JSON.parse(value||'[]');
      data.forEach(item=>{if(item?.id&&!known.has(item.id))item.protocol=makeProtocol(item.createdAt)});
      value=JSON.stringify(data);
    }catch(error){console.error('Falha ao padronizar protocolo HEURO',error)}
  }
  return original.call(this,key,value);
};
})();