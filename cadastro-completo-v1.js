(()=>{
'use strict';
const $=id=>document.getElementById(id);
const users=()=>{try{return JSON.parse(localStorage.getItem('heuroUsers')||'[]')}catch{return[]}};
const save=data=>localStorage.setItem('heuroUsers',JSON.stringify(data));
const upper=v=>String(v||'').trim().toLocaleUpperCase('pt-BR');
const onlyDigits=v=>String(v||'').replace(/\D/g,'').slice(0,11);
const cpfMask=v=>{const d=onlyDigits(v);return d.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')};
function validCpf(v){const cpf=onlyDigits(v);if(cpf.length!==11||/^(\d)\1+$/.test(cpf))return false;let s=0;for(let i=0;i<9;i++)s+=Number(cpf[i])*(10-i);let d=(s*10)%11;if(d===10)d=0;if(d!==Number(cpf[9]))return false;s=0;for(let i=0;i<10;i++)s+=Number(cpf[i])*(11-i);d=(s*10)%11;if(d===10)d=0;return d===Number(cpf[10])}
function build(){
 const form=$('registerFormNew');if(!form||form.dataset.complete==='1')return;form.dataset.complete='1';
 form.innerHTML=`
 <div class="register-brand"><div class="register-brand-mark">H+</div><div><strong>HEURO TRANSPORTE</strong><small>Cadastro de acesso</small></div></div>
 <div class="register-intro"><span>PRIMEIRO ACESSO</span><h2>Crie seu cadastro</h2><p>Preencha os dados abaixo. O acesso será liberado após aprovação de um administrador.</p></div>
 <div class="register-grid">
  <label class="wide">Nome completo<small>Nome que aparecerá nas planilhas e documentos.</small><input id="regName" autocapitalize="characters" autocomplete="name" required></label>
  <label>Nome de usuário<small>Nome exibido na abertura do sistema.</small><input id="regUser" autocomplete="username" required></label>
  <label>CPF<input id="regCpf" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="000.000.000-00" required></label>
  <label class="wide">E-mail<input id="regEmail" type="email" autocomplete="email" placeholder="nome@exemplo.com" required></label>
  <label>Cargo/Função<select id="regRole" required><option value="">Selecione</option><option>Enfermeiro</option><option>Técnico de Enfermagem</option><option>Médico</option><option>Motorista</option><option>Maqueiro</option><option>Fisioterapeuta</option><option>Administrativo</option><option>Coordenação</option><option>Direção</option><option value="Outro">Outro</option></select></label>
  <label id="regOtherRoleWrap" class="hidden-role">Outro cargo/função<input id="regOtherRole" placeholder="Digite o cargo ou função"></label>
  <label class="wide">Perfil solicitado<select id="regProfile" required><option value="solicitante">Solicitante de transporte</option><option value="transporte">Executante de transporte</option><option value="administrador">Administrador</option></select></label>
  <label>Senha<input id="regPass" type="password" autocomplete="new-password" minlength="6" required></label>
  <label>Confirmar senha<input id="regPassConfirm" type="password" autocomplete="new-password" minlength="6" required></label>
 </div>
 <button class="register-submit" type="submit">Enviar cadastro para aprovação</button>
 <button id="registerBackNew" class="register-back" type="button">Voltar</button>
 <p id="registerMessageNew" class="register-message" aria-live="polite"></p>`;
 const style=document.createElement('style');style.id='completeRegisterStyles';style.textContent=`
 #registerNew{background:linear-gradient(180deg,#f5f9ff 0,#fff 48%);min-height:100dvh;padding:calc(env(safe-area-inset-top,0px) + 24px) 16px calc(env(safe-area-inset-bottom,0px) + 28px);overflow-y:auto}
 #registerNew .register-wrap{max-width:720px;margin:0 auto}.register-wrap>.card{border:0;border-radius:28px;padding:22px;box-shadow:0 18px 50px rgba(17,48,93,.12);background:#fff}
 .register-brand{display:flex;align-items:center;gap:12px;padding:4px 0 18px;border-bottom:1px solid #e5edf7}.register-brand-mark{width:48px;height:48px;border-radius:15px;background:linear-gradient(145deg,#0756b8,#07327a);color:#77d52b;display:grid;place-items:center;font-weight:900;font-size:20px}.register-brand strong{display:block;color:#0a3e84;font-size:17px}.register-brand small{display:block;color:#687991;margin-top:2px}
 .register-intro{padding:22px 0 18px}.register-intro span{color:#1263ab;font-size:12px;letter-spacing:.11em;font-weight:900}.register-intro h2{margin:5px 0 6px;font-size:30px;color:#14233d}.register-intro p{margin:0;color:#66758b;line-height:1.45}
 .register-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.register-grid label{display:grid;gap:7px;color:#172641;font-weight:800}.register-grid label.wide{grid-column:1/-1}.register-grid label small{font-weight:400;color:#78869a;font-size:12px}.register-grid input,.register-grid select{width:100%;min-height:52px;border:1px solid #ccd8e7;border-radius:14px;padding:0 14px;font-size:16px;background:#fff;box-sizing:border-box}.register-grid input:focus,.register-grid select:focus{outline:3px solid rgba(35,132,226,.22);border-color:#438fd8}.hidden-role{display:none!important}
 .register-submit{width:100%;min-height:56px;margin-top:22px;border:0;border-radius:15px;background:linear-gradient(135deg,#0877c9,#0751a5);color:#fff;font-size:17px;font-weight:900}.register-back{width:100%;border:0;background:transparent;color:#0c61aa;font-size:16px;padding:17px}.register-message{text-align:center;color:#a11;margin:4px 0 0;min-height:20px}
 @media(max-width:560px){#registerNew{padding-left:12px;padding-right:12px}.register-wrap>.card{padding:18px;border-radius:23px}.register-grid{grid-template-columns:1fr}.register-grid label.wide{grid-column:auto}.register-intro h2{font-size:27px}}
 `;document.head.appendChild(style);
 const name=$('regName');name.style.textTransform='uppercase';name.addEventListener('input',()=>{const p=name.selectionStart;name.value=name.value.toLocaleUpperCase('pt-BR');try{name.setSelectionRange(p,p)}catch{}});
 $('regCpf').addEventListener('input',e=>e.target.value=cpfMask(e.target.value));
 $('regRole').addEventListener('change',()=>{const other=$('regRole').value==='Outro';$('regOtherRoleWrap').classList.toggle('hidden-role',!other);$('regOtherRole').required=other;if(!other)$('regOtherRole').value=''});
 $('registerBackNew').addEventListener('click',()=>{document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$('loginNew')?.classList.add('active');window.scrollTo(0,0)});
 form.addEventListener('submit',e=>{
  e.preventDefault();e.stopImmediatePropagation();
  const msg=$('registerMessageNew');msg.style.color='#a11';
  const username=$('regUser').value.trim();const cpf=$('regCpf').value;const email=$('regEmail').value.trim().toLowerCase();const pass=$('regPass').value;const confirm=$('regPassConfirm').value;
  if(!validCpf(cpf)){msg.textContent='Informe um CPF válido.';return}
  if(pass!==confirm){msg.textContent='A confirmação da senha não confere.';return}
  const data=users();if(data.some(u=>String(u.username||'').toLowerCase()===username.toLowerCase())){msg.textContent='Este nome de usuário já existe.';return}
  if(data.some(u=>onlyDigits(u.cpf)===onlyDigits(cpf))){msg.textContent='Este CPF já está cadastrado.';return}
  if(data.some(u=>String(u.email||'').toLowerCase()===email)){msg.textContent='Este e-mail já está cadastrado.';return}
  const role=$('regRole').value==='Outro'?$('regOtherRole').value.trim():$('regRole').value;
  data.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),fullName:upper($('regName').value),username,cpf:onlyDigits(cpf),email,cargoFuncao:role,profile:$('regProfile').value,password:pass,status:'aguardando',createdAt:new Date().toISOString()});save(data);
  msg.style.color='#08743a';msg.textContent='Cadastro enviado para aprovação.';form.reset();$('regOtherRoleWrap').classList.add('hidden-role');setTimeout(()=>$('registerBackNew').click(),1100)
 },true)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();