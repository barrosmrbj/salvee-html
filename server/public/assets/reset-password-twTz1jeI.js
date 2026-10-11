import{B as m}from"./Button-kVf4TgMB.js";import{I as i,g as d}from"./Input-B4RMibzo.js";import{L as p}from"./Spinner-u1aW0YGE.js";import{s as a}from"./Toast-BQaWcss2.js";import{g as f,a as u,A as v}from"./index-CF8eeLAn.js";import{p as h,P as w}from"./validation-C8hqb11c.js";function C(){const e=document.createElement("div");return e.className="screen bg-white",e.innerHTML=`
    <div class="flex items-center p-4 border-b border-gray-100">
      <h1 class="text-lg font-semibold ml-2">Criar nova senha</h1>
    </div>
    <div class="flex-1 p-6 flex flex-col gap-6">
      <p class="text-gray-500 text-sm">Escolha a nova senha da sua conta Salvee.</p>
      <form id="reset-form" class="flex flex-col gap-4">
        <div id="field-password"></div>
        <div id="field-confirm"></div>
        <div id="btn-save" class="mt-2"></div>
      </form>
    </div>
  `,e}function I(){const e=f().get("token")??"";if(!e){a('Link inválido. Peça um novo em "Esqueci minha senha".',"error"),window.location.replace("#/forgot-password");return}const r=document.getElementById("reset-form");r.querySelector("#field-password").appendChild(i({id:"password",label:"Nova senha",type:"password",placeholder:w,required:!0})),r.querySelector("#field-confirm").appendChild(i({id:"confirm",label:"Confirme a nova senha",type:"password",placeholder:"••••••••",required:!0})),document.getElementById("btn-save").appendChild(m({label:"Salvar nova senha",variant:"primary",fullWidth:!0,type:"submit"})),r.addEventListener("submit",async l=>{l.preventDefault();const o=d(r,"password"),c=d(r,"confirm"),s=h(o);if(s){a(s,"error");return}if(o!==c){a("As senhas não coincidem","error");return}const t=p();document.body.appendChild(t);try{await u.resetPassword(e,o),a("Senha alterada! Entre com a nova senha.","success"),window.location.replace("#/login")}catch(n){a(n instanceof v?n.message:"Erro ao salvar. Tente novamente.","error")}finally{t.remove()}})}export{I as mount,C as render};
