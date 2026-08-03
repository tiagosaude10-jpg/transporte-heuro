(()=>{
'use strict';
const $=id=>document.getElementById(id);
const calendarSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 9h16"/></svg>';
const clockSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
function addStyles(){
 if(document.getElementById('request-date-time-style'))return;
 const style=document.createElement('style');style.id='request-date-time-style';style.textContent=`
 .rdt-field{display:block!important;width:100%!important;min-width:0!important}
 .rdt-label{display:block;margin:0 0 8px;font-weight:700;color:#14233f}
 .rdt-control{position:relative;width:100%;height:58px;border:1.5px solid #cbd7e7;border-radius:18px;background:#fff;overflow:hidden;box-sizing:border-box}
 .rdt-control:focus-within{border-color:#1768ad;box-shadow:0 0 0 3px rgba(23,104,173,.12)}
 .rdt-control input{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0 92px 0 20px!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;box-sizing:border-box!important;font-size:1rem!important;color:#14233f!important;opacity:1!important;z-index:2!important;-webkit-appearance:none!important;appearance:none!important}
 .rdt-control input:focus{outline:none!important}
 .rdt-control input::-webkit-date-and-time-value{text-align:left}
 .rdt-control input::-webkit-calendar-picker-indicator{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;opacity:0;cursor:pointer}
 .rdt-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:30px;height:30px;display:grid;place-items:center;color:#687b96;z-index:3;pointer-events:none}
 .rdt-icon svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
 .rdt-clear{position:absolute;right:50px;top:50%;transform:translateY(-50%);width:38px;height:38px;padding:0;border:0;background:#fff;color:#687b96;font-size:32px;line-height:1;z-index:5;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
 .rdt-help{display:block;margin:7px 0 0;color:#677791;font-size:.86rem;line-height:1.25}
 @media(max-width:390px){.rdt-control{height:56px}.rdt-control input{padding-left:16px!important;padding-right:88px!important}.rdt-icon{right:9px}.rdt-clear{right:44px}}
 `;document.head.appendChild(style)
}
function build(id,labelText,type,helpText){
 const input=$(id);if(!input||input.dataset.rdtReady==='1')return;
 const oldLabel=input.closest('label');if(!oldLabel)return;
 const wrapper=document.createElement('label');wrapper.className='rdt-field';wrapper.htmlFor=id;
 const title=document.createElement('span');title.className='rdt-label';title.textContent=labelText;
 const control=document.createElement('span');control.className='rdt-control';
 input.type=type;input.dataset.rdtReady='1';input.setAttribute('aria-label',labelText);input.setAttribute('autocomplete','off');
 const clear=document.createElement('button');clear.type='button';clear.className='rdt-clear';clear.textContent='×';clear.setAttribute('aria-label',`Limpar ${labelText.toLowerCase()}`);
 clear.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))});
 const visual=document.createElement('span');visual.className='rdt-icon';visual.innerHTML=type==='time'?clockSvg:calendarSvg;
 const help=document.createElement('small');help.className='rdt-help';help.textContent=helpText;
 control.append(input,clear,visual);wrapper.append(title,control,help);oldLabel.replaceWith(wrapper)
}
function install(){addStyles();build('birthDate','Data de nascimento','date','Digite a data ou selecione no calendário');build('transportDate','Data do transporte','date','Digite a data ou selecione no calendário');build('transportTime','Horário previsto','time','Digite o horário ou selecione no relógio')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();