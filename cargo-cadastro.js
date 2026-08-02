(()=>{
'use strict';
const $=id=>document.getElementById(id);
const users=()=>{try{return JSON.parse(localStorage.getItem('heuroUsers')||'[]')}catch{return[]}};
const save=data=>localStorage.setItem('heuroUsers',JSON.stringify(data));
const digits=v=>String(v||'').replace(/\D/g,'').slice(0,11);
const cpfMask=v=>digits(v).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
function validCpf(v){const c=digits(v);if(c.length!==11||/^(\d)\1+$/.test(c))return false;let s=0;for(let i=0;i<9;i++)s+=Number(c[i])*(10-i);let d=(s*10)%11;if(d===10)d=0;if(d!==Number(c[9]))return false;s=0;for(let i=0;i<10;i++)s+=Number(c[i])*(11-i);d=(s*10)%11;if(d===10)d=0;return d===Number(c[10])}
function showLogin(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$('loginNew')?.classList.add('active');window.scrollTo(0,0)}
function field(label,control,help=''){return `<label class="register-field"><span class="register-label">${label}</span>${help?`<small>${help}</small>`:''}${control}</label>`}
function build(){
 const form=$('registerFormNew');if(!form||form.dataset.complete==='2')return;form.dataset.complete='2';
 form.innerHTML=`
 <div class="register-brand"><img src="AC1F8155-6FA3-4763-B069-50086DF91DD6.png?v=49" alt="Transportes HEURO"><div><strong>TRANSPORTES HEURO</strong><small>Solicitação de acesso ao sistema</small></div></div>
 <div class="register-intro"><span>PRIMEIRO CADASTRO</span><h2>Crie seu acesso</h2><p>Preencha seus dados. O cadastro será analisado por um administrador.</p></div>
 <div class="register-grid">
 ${field('Nome completo','<input id="regName" autocapitalize="characters" autocomplete="name" required>','Nome que aparecerá nas planilhas e documentos.')}
 ${field('Nome de usuário','<input id="regUser" autocomplete="username" required>','Nome exibido na abertura do sistema.')}
 ${field('CPF','<input id="regCpf" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" required>')}
 ${field('E-mail','<input id="regEmail" type="email" autocomplete="email" placeholder="nome@exemplo.com" required>')}
 ${field('Cargo/Função','<select id="regRole" required><option value="">Selecione</option><option>Enfermeiro</option><option>Técnico de Enfermagem</option><option>Médico</option><option>Motorista</option><option>Maqueiro</option><option>Fisioterapeuta</option><option>Administrativo</option><option>Coordenação</option><option>Direção</option><option value="Outro">Outro</option></select>')}
 <label id="regOtherRoleWrap" class="register-field hidden-role"><span class="register-label">Outro cargo/função</span><input id="regOtherRole" placeholder="Digite o cargo ou função"></label>
 ${field('Perfil solicitado','<select id="regProfile" required><option value="solicitante">Solicitante de transporte</option><option value="transporte">Executante de transporte</option><option value="administrador">Administrador</option></select>')}
 ${field('Senha','<input id="regPass" type="password" autocomplete="new-password" minlength="6" required>')}
 ${field('Confirmar senha','<input id="regPassConfirm" type="password" autocomplete="new-password" minlength="6" required>')}
 </div>
 <button class="register-submit" type="submit">Enviar cadastro para aprovação</button><button id="registerBackNew" class="register-back" type="button">Voltar</button><p id="registerMessageNew" class="register-message" aria-live="polite"></p>`;
 if(!$('completeRegisterStyles')){const style=document.createElement('style');style.id='completeRegisterStyles';style.textContent=`
 #registerNew{background:linear-gradient(180deg,#f2f7ff 0,#fff 58%);min-height:100dvh;padding:calc(env(safe-area-inset-top,0px) + 10px) 10px calc(env(safe-area-inset-bottom,0px) + 20px);overflow-y:auto}
 .register-wrap{max-width:680px!important;margin:0 auto!important}
 .register-wrap>.card{border:0!important;border-radius:24px!important;padding:14px!important;background:#fff!important;box-shadow:0 14px 38px rgba(17,48,93,.12)!important}
 .register-brand{display:flex;align-items:center;gap:11px;padding:0 0 12px;border-bottom:1px solid #e5edf7}
 .register-brand img{width:64px;height:64px;border-radius:17px;object-fit:cover;box-shadow:0 5px 14px rgba(10,56,120,.2);flex:0 0 auto}
 .register-brand strong{display:block;color:#0b438e;font-size:17px;line-height:1.15}.register-brand small{display:block;color:#718096;margin-top:3px;font-size:12px}
 .register-intro{padding:13px 2px 11px}.register-intro span{color:#1164ad;font-size:11px;letter-spacing:.11em;font-weight:900}.register-intro h2{margin:3px 0 3px;font-size:25px;color:#14233d}.register-intro p{margin:0;color:#66758b;line-height:1.35;font-size:13px}
 .register-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px}
 .register-field{display:grid!important;grid-template-columns:1fr!important;gap:4px!important;margin:0!important;padding:8px!important;border:1px solid #d9e5f2!important;border-radius:15px!important;background:#f8fbff!important;box-sizing:border-box!important;min-width:0!important;width:100%!important}
 .register-label{display:inline-flex;width:max-content;max-width:100%;padding:3px 8px;border-radius:8px;background:#dcecff;color:#0c4f94;font-weight:900;font-size:12px;line-height:1.2}
 .register-field small{font-weight:400;color:#78869a;font-size:10px;line-height:1.25;padding-left:2px}
 .register-field input,.register-field select{display:block!important;width:100%!important;max-width:none!important;min-width:0!important;height:48px!important;min-height:48px!important;border:1px solid #c5d5e7!important;border-radius:12px!important;padding:0 12px!important;font-size:16px!important;background:#fff!important;box-sizing:border-box!important;margin:0!important;-webkit-appearance:none}
 .register-field select{background-image:linear-gradient(45deg,transparent 50%,#18314f 50%),linear-gradient(135deg,#18314f 50%,transparent 50%);background-position:calc(100% - 18px) 20px,calc(100% - 12px) 20px;background-size:6px 6px,6px 6px;background-repeat:no-repeat;padding-right:34px!important}
 .register-field input:focus,.register-field select:focus{outline:3px solid rgba(35,132,226,.20)!important;border-color:#438fd8!important}
 .hidden-role{display:none!important}.register-submit{width:100%;min-height:52px;margin-top:13px;border:0;border-radius:14px;background:linear-gradient(135deg,#0877c9,#0751a5);color:#fff;font-size:16px;font-weight:900}.register-back{width:100%;border:0;background:transparent;color:#0c61aa;font-size:15px;padding:12px}.register-message{text-align:center;margin:2px 0 0;min-height:18px;font-size:13px}
 @media(max-width:560px){.register-wrap>.card{padding:12px!important;border-radius:21px!important}.register-grid{grid-template-columns:1fr;gap:8px}.register-brand img{width:56px;height:56px}.register-intro{padding:10px 2px 9px}.register-intro h2{font-size:23px}.register-field{padding:7px!important}.register-field input,.register-field select{height:46px!important;min-height:46px!important}}
 `;document.head.appendChild(style)}
 const name=$('regName');name.style.textTransform='uppercase';name.addEventListener('input',()=>{const p=name.selectionStart;name.value=name.value.toLocaleUpperCase('pt-BR');try{name.setSelectionRange(p,p)}catch{}});$('regCpf').addEventListener('input',e=>e.target.value=cpfMask(e.target.value));$('regRole').addEventListener('change',()=>{const custom=$('regRole').value==='Outro';$('regOtherRoleWrap').classList.toggle('hidden-role',!custom);$('regOtherRole').required=custom;if(!custom)$('regOtherRole').value=''});$('registerBackNew').addEventListener('click',showLogin);
}
function submit(e){if(e.target?.id!=='registerFormNew')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const msg=$('registerMessageNew');msg.style.color='#a11';const data=users();const username=$('regUser').value.trim();const cpf=$('regCpf').value;const email=$('regEmail').value.trim().toLowerCase();const pass=$('regPass').value;const confirm=$('regPassConfirm').value;if(!validCpf(cpf)){msg.textContent='Informe um CPF válido.';return}if(pass!==confirm){msg.textContent='A confirmação da senha não confere.';return}if(data.some(u=>String(u.username||'').toLowerCase()===username.toLowerCase())){msg.textContent='Este nome de usuário já existe.';return}if(data.some(u=>digits(u.cpf)===digits(cpf))){msg.textContent='Este CPF já está cadastrado.';return}if(data.some(u=>String(u.email||'').toLowerCase()===email)){msg.textContent='Este e-mail já está cadastrado.';return}const role=$('regRole').value==='Outro'?$('regOtherRole').value.trim():$('regRole').value;data.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),fullName:$('regName').value.trim().toLocaleUpperCase('pt-BR'),username,cpf:digits(cpf),email,cargoFuncao:role,role,profile:$('regProfile').value,password:pass,status:'aguardando',createdAt:new Date().toISOString()});save(data);msg.style.color='#08743a';msg.textContent='Cadastro enviado para aprovação.';e.target.reset();$('regOtherRoleWrap').classList.add('hidden-role');setTimeout(showLogin,1100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();new MutationObserver(build).observe(document.documentElement,{subtree:true,childList:true});document.addEventListener('submit',submit,true);
})();