(()=>{
  'use strict';

  function apply(){
    const screen=document.getElementById('registerNew');
    const wrap=screen?.querySelector('.register-wrap');
    const card=wrap?.querySelector('.card');
    const form=document.getElementById('registerFormNew');
    if(!screen||!wrap||!card||!form)return false;

    let style=document.getElementById('cadastroFixV6Styles');
    if(!style){
      style=document.createElement('style');
      style.id='cadastroFixV6Styles';
      document.head.appendChild(style);
    }
    style.textContent=`
      #registerNew.active{
        width:100%!important;
        max-width:none!important;
        padding-left:2px!important;
        padding-right:2px!important;
        box-sizing:border-box!important;
      }
      #registerNew .register-wrap{
        width:100%!important;
        max-width:none!important;
        margin:0!important;
        padding:0!important;
        box-sizing:border-box!important;
      }
      #registerNew .register-wrap>.card{
        width:calc(100% - 4px)!important;
        max-width:none!important;
        margin:0 2px!important;
        padding:10px!important;
        box-sizing:border-box!important;
      }
      #registerNew .register-grid,
      #registerNew .register-field,
      #registerNew .register-field input,
      #registerNew .register-field select{
        width:100%!important;
        max-width:none!important;
        box-sizing:border-box!important;
      }
      @media (max-width:560px){
        #registerNew.active{padding-left:0!important;padding-right:0!important}
        #registerNew .register-wrap>.card{
          width:calc(100% - 2px)!important;
          margin:0 1px!important;
          padding:8px!important;
          border-radius:18px!important;
        }
      }
    `;

    const select=document.getElementById('regProfile');
    if(select){
      let placeholder=Array.from(select.options).find(option=>option.value==='');
      if(!placeholder){
        placeholder=document.createElement('option');
        placeholder.value='';
        placeholder.textContent='Selecione';
        placeholder.disabled=true;
        select.insertBefore(placeholder,select.firstChild);
      }else{
        placeholder.textContent='Selecione';
        placeholder.disabled=true;
      }
      select.required=true;
      if(!select.dataset.userSelected){
        select.value='';
      }
      if(select.dataset.selectionListener!=='1'){
        select.addEventListener('change',()=>{select.dataset.userSelected='1'});
        select.dataset.selectionListener='1';
      }
    }
    return true;
  }

  function runRepeatedly(){
    apply();
    [100,300,700,1200,2000].forEach(delay=>setTimeout(apply,delay));
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',runRepeatedly);
  }else{
    runRepeatedly();
  }

  new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
})();
