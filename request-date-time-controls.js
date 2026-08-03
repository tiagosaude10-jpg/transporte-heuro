(()=>{
'use strict';
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const isoToBr=value=>{if(!value)return'';const [y,m,d]=String(value).split('-');return y&&m&&d?`${d}/${m}/${y}`:''};
const brToIso=value=>{const digits=String(value||'').replace(/\D/g,'').slice(0,8);if(digits.length!==8)return'';const d=digits.slice(0,2),m=digits.slice(2,4),y=digits.slice(4,8);const date=new Date(`${y}-${m}-${d}T12:00:00`);if(Number.isNaN(date.getTime())||date.getFullYear()!==Number(y)||date.getMonth()+1!==Number(m)||date.getDate()!==Number(d))return'';return`${y}-${m}-${d}`};
const maskDate=value=>{const d=String(value||'').replace(/\D/g,'').slice(0,8);return d.length<=2?d:d.length<=4?`${d.slice(0,2)}/${d.slice(2)}`:`${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`};
const maskTime=value=>{const d=String(value||'').replace(/\D/g,'').slice(0,4);return d.length<=2?d:`${d.slice(0,2)}:${d.slice(2)}`};
const validTime=value=>{const m=String(value||'').match(/^(\d{2}):(\d{2})$/);return m&&Number(m[1])<24&&Number(m[2])<60?value:''};
function openPicker(native){try{if(typeof native.showPicker==='function'){native.showPicker();return}}catch{}native.focus();native.click();}
function build(id,type,helper){
 const native=$(id);if(!native||native.dataset.enhanced==='1')return;
 native.dataset.enhanced='1';
 const label=native.closest('label');if(!label)return;
 const wrapper=document.createElement('div');wrapper.className='heuro-datetime-control';
 const visible=document.createElement('input');visible.type='text';visible.className='heuro-datetime-text';visible.inputMode='numeric';visible.autocomplete='off';visible.placeholder=type==='date'?'DD/MM/AAAA':'HH:MM';visible.setAttribute('aria-label',type==='date'?'Digite a data':'Digite o horário');
 visible.value=type==='date'?isoToBr(native.value):native.value;
 const clear=document.createElement('button');clear.type='button';clear.className='heuro-datetime-clear';clear.textContent='×';clear.setAttribute('aria-label',type==='date'?'Apagar data':'Apagar horário');
 const picker=document.createElement('button');picker.type='button';picker.className='heuro-datetime-picker';picker.innerHTML=type==='date'?'&#128197;':'&#128339;';picker.setAttribute('aria-label',type==='date'?'Abrir calendário':'Abrir relógio');
 native.classList.add('heuro-native-picker');
 native.parentNode.insertBefore(wrapper,native);
 wrapper.append(visible,clear,picker,native);
 const help=document.createElement('small');help.className='heuro-datetime-help';help.textContent=helper;wrapper.after(help);
 const syncVisible=()=>{visible.value=type==='date'?isoToBr(native.value):native.value};
 native.addEventListener('change',syncVisible);
 visible.addEventListener('input',()=>{visible.value=type==='date'?maskDate(visible.value):maskTime(visible.value);native.value=type==='date'?brToIso(visible.value):validTime(visible.value);native.dispatchEvent(new Event('input',{bubbles:true}))});
 visible.addEventListener('blur',()=>{if(type==='date'&&visible.value&&!native.value){visible.value='';}if(type==='time'&&visible.value&&!native.value){visible.value='';}});
 clear.addEventListener('click',()=>{visible.value='';native.value='';native.dispatchEvent(new Event('change',{bubbles:true}));visible.focus()});
 picker.addEventListener('click',()=>openPicker(native));
}
function install(){
 build('birthDateNew','date','Digite a data ou selecione no calendário');
 build('transportDateNew','date','Digite a data ou selecione no calendário');
 build('transportTimeNew','time','Digite o horário ou selecione no relógio');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(install).observe(document.documentElement,{subtree:true,childList:true});
})();