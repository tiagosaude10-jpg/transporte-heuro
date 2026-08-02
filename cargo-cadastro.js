(()=>{
'use strict';
const $=id=>document.getElementById(id);
const readUsers=()=>{try{return JSON.parse(localStorage.getItem('heuroUsers')||'[]')}catch{return[]}};
const saveUsers=data=>localStorage.setItem('heuroUsers',JSON.stringify(data));

function ensureFields(){
  const form=$('registerFormNew');
  const profile=$('regProfile');
  if(!form||!profile||$('regRole'))return;

  const roleLabel=document.createElement('label');
  roleLabel.setAttribute('for','regRole');
  roleLabel.textContent='Cargo/Função';

  const role=document.createElement('select');
  role.id='regRole';
  role.required=true;
  role.innerHTML=`
    <option value="">Selecione o cargo/função</option>
    <option value="Enfermeiro">Enfermeiro</option>
    <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
    <option value="Médico">Médico</option>
    <option value="Motorista">Motorista</option>
    <option value="Maqueiro">Maqueiro</option>
    <option value="Fisioterapeuta">Fisioterapeuta</option>
    <option value="Administrativo">Administrativo</option>
    <option value="Coordenação">Coordenação</option>
    <option value="Direção">Direção</option>
    <option value="Outro">Outro</option>`;

  const otherLabel=document.createElement('label');
  otherLabel.id='regRoleOtherLabel';
  otherLabel.setAttribute('for','regRoleOther');
  otherLabel.textContent='Informe o outro cargo/função';
  otherLabel.style.display='none';

  const other=document.createElement('input');
  other.id='regRoleOther';
  other.placeholder='Digite o cargo ou a função';
  other.style.textTransform='uppercase';
  other.setAttribute('autocapitalize','characters');
  other.style.display='none';

  profile.insertAdjacentElement('afterend',roleLabel);
  roleLabel.insertAdjacentElement('afterend',role);
  role.insertAdjacentElement('afterend',otherLabel);
  otherLabel.insertAdjacentElement('afterend',other);

  role.addEventListener('change',()=>{
    const custom=role.value==='Outro';
    otherLabel.style.display=custom?'':'none';
    other.style.display=custom?'':'none';
    other.required=custom;
    if(!custom)other.value='';
  });
  other.addEventListener('input',()=>{other.value=other.value.toLocaleUpperCase('pt-BR')});
}

function handleSubmit(event){
  const form=event.target;
  if(form?.id!=='registerFormNew')return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const data=readUsers();
  const username=$('regUser')?.value.trim()||'';
  const role=$('regRole')?.value||'';
  const other=$('regRoleOther')?.value.trim().toLocaleUpperCase('pt-BR')||'';
  const message=$('registerMessageNew');

  if(data.some(user=>String(user.username||'').toLowerCase()===username.toLowerCase())){
    if(message)message.textContent='Este usuário já existe.';
    return;
  }
  if(!role){
    if(message)message.textContent='Selecione o cargo/função.';
    $('regRole')?.focus();
    return;
  }
  if(role==='Outro'&&!other){
    if(message)message.textContent='Informe o outro cargo/função.';
    $('regRoleOther')?.focus();
    return;
  }

  data.push({
    id:String(Date.now()),
    fullName:$('regName')?.value.trim().toLocaleUpperCase('pt-BR')||'',
    username,
    password:$('regPass')?.value||'',
    profile:$('regProfile')?.value||'solicitante',
    role:role==='Outro'?other:role,
    cargoFuncao:role==='Outro'?other:role,
    status:'aguardando'
  });
  saveUsers(data);
  if(message)message.textContent='Cadastro enviado para aprovação.';
  form.reset();
  $('regRoleOtherLabel')?.style.setProperty('display','none');
  $('regRoleOther')?.style.setProperty('display','none');
  setTimeout(()=>{$('registerBackNew')?.click()},900);
}

function start(){ensureFields()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
new MutationObserver(ensureFields).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('submit',handleSubmit,true);
})();
