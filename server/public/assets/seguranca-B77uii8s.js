import{B as c}from"./Button-kVf4TgMB.js";import{I as o,g as n}from"./Input-B4RMibzo.js";import{s as a}from"./Toast-BQaWcss2.js";import{a as u,A as p}from"./index-CpPucNuj.js";import{P as f}from"./PageHeader-B5dshm27.js";import{p as m,P as h}from"./validation-C8hqb11c.js";function S(){const e=document.createElement("div");e.className="screen bg-gray-50",e.appendChild(f("Segurança"));const r=document.createElement("div");return r.className="p-4 pb-24 flex flex-col gap-4",r.innerHTML=`
    <form id="pw-form" class="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
      <h2 class="font-semibold text-gray-900">Alterar senha</h2>
      <div id="f-current"></div>
      <div id="f-new"></div>
      <div id="f-confirm"></div>
      <div id="f-save"></div>
      <a href="#/forgot-password" class="text-sm text-salvee-orange text-center">Não sei a senha atual (entrei com Google, Facebook ou Apple)</a>
    </form>
    <div class="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
      <h2 class="font-semibold text-gray-900">Excluir conta</h2>
      <p class="text-sm text-gray-500">Apaga sua conta e seus dados de forma definitiva.</p>
      <a href="#/excluir-conta" class="mt-1 w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold text-center">Excluir minha conta</a>
    </div>
  `,e.appendChild(r),e}function E(){const e=document.getElementById("pw-form");e.querySelector("#f-current").appendChild(o({id:"current",label:"Senha atual",type:"password",required:!0})),e.querySelector("#f-new").appendChild(o({id:"new",label:"Nova senha",type:"password",placeholder:h,required:!0})),e.querySelector("#f-confirm").appendChild(o({id:"confirm",label:"Confirme a nova senha",type:"password",required:!0})),e.querySelector("#f-save").appendChild(c({label:"Salvar nova senha",variant:"primary",fullWidth:!0,type:"submit"})),e.addEventListener("submit",async r=>{r.preventDefault();const s=n(e,"current"),t=n(e,"new");if(!s){a("Informe a senha atual","error");return}const d=m(t);if(d){a(d,"error");return}if(t!==n(e,"confirm")){a("As senhas não coincidem","error");return}const i=e.querySelector('button[type="submit"]');i.disabled=!0;try{await u.changePassword(s,t),e.reset(),a("Senha alterada","success")}catch(l){a(l instanceof p?l.message:"Erro ao alterar a senha","error")}finally{i.disabled=!1}})}export{E as mount,S as render};
