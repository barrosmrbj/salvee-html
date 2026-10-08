import{B as c}from"./Button-kVf4TgMB.js";import{I as t,g as i}from"./Input-B4RMibzo.js";import{L as m}from"./Spinner-u1aW0YGE.js";import{s as a}from"./Toast-Drk6oq-5.js";import{g as p,a as f,A as u}from"./index-PjL8RKkz.js";function b(){const e=document.createElement("div");return e.className="screen bg-white",e.innerHTML=`
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
  `,e}function x(){const e=p().get("token")??"";if(!e){a('Link inválido. Peça um novo em "Esqueci minha senha".',"error"),window.location.replace("#/forgot-password");return}const r=document.getElementById("reset-form");r.querySelector("#field-password").appendChild(t({id:"password",label:"Nova senha",type:"password",placeholder:"Mínimo de 6 caracteres",required:!0})),r.querySelector("#field-confirm").appendChild(t({id:"confirm",label:"Confirme a nova senha",type:"password",placeholder:"••••••••",required:!0})),document.getElementById("btn-save").appendChild(c({label:"Salvar nova senha",variant:"primary",fullWidth:!0,type:"submit"})),r.addEventListener("submit",async d=>{d.preventDefault();const o=i(r,"password"),l=i(r,"confirm");if(o.length<6){a("A senha precisa ter pelo menos 6 caracteres","error");return}if(o!==l){a("As senhas não coincidem","error");return}const n=m();document.body.appendChild(n);try{await f.resetPassword(e,o),a("Senha alterada! Entre com a nova senha.","success"),window.location.replace("#/login")}catch(s){a(s instanceof u?s.message:"Erro ao salvar. Tente novamente.","error")}finally{n.remove()}})}export{x as mount,b as render};
