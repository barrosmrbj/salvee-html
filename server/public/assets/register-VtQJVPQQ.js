import{B as p}from"./Button-kVf4TgMB.js";import{I as r,g as t}from"./Input-B4RMibzo.js";import{L as u}from"./Spinner-u1aW0YGE.js";import{s as a}from"./Toast-BQaWcss2.js";import{S as f}from"./SocialLogin-D8R_3HE4.js";import{a as v,A as g}from"./index-DYC0c1kv.js";function C(){const e=document.createElement("div");return e.className="screen bg-white overflow-y-auto",e.innerHTML=`
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold ml-2">Crie uma conta</h1>
    </div>
    <div class="p-6 flex flex-col gap-4">
      <p class="text-gray-500 text-sm">Preencha as informações abaixo para criar sua conta</p>
      <form id="register-form" class="flex flex-col gap-4">
        <div id="field-name"></div>
        <div id="field-email"></div>
        <div id="field-password"></div>
        <div id="field-confirm"></div>
        <label class="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" id="terms" class="mt-0.5 accent-salvee-orange" />
          <span>Eu concordo com os <a href="#" class="text-salvee-orange underline">termos & condições</a></span>
        </label>
        <div id="btn-register"></div>
      </form>
      <div id="social-section" class="hidden">
        <div class="flex items-center gap-3 my-2">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400">ou crie a conta com</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>
        <div id="social-register" class="mt-4"></div>
      </div>
      <p class="text-center text-sm text-gray-500">Já tem uma conta? <a href="#/login" class="text-salvee-orange font-medium">Clique aqui</a></p>
    </div>
  `,e}function q(){document.getElementById("back-btn").addEventListener("click",()=>history.back());const e=document.getElementById("register-form");e.querySelector("#field-name").appendChild(r({id:"name",label:"Nome",placeholder:"Ex. José Lucas",required:!0})),e.querySelector("#field-email").appendChild(r({id:"email",label:"Email",type:"email",placeholder:"seuemail@gmail.com",required:!0})),e.querySelector("#field-password").appendChild(r({id:"password",label:"Senha",type:"password",placeholder:"••••••••",required:!0})),e.querySelector("#field-confirm").appendChild(r({id:"confirm",label:"Confirme a senha",type:"password",placeholder:"••••••••",required:!0})),document.getElementById("btn-register").appendChild(p({label:"Avançar",variant:"primary",fullWidth:!0,type:"submit"})),document.getElementById("social-register").appendChild(f("Cadastrar",document.getElementById("social-section"))),e.addEventListener("submit",async d=>{d.preventDefault();const s=t(e,"name"),o=t(e,"email"),i=t(e,"password"),c=t(e,"confirm"),m=e.querySelector("#terms").checked;if(!s||!o||!i){a("Preencha todos os campos","error");return}if(i!==c){a("As senhas não coincidem","error");return}if(!m){a("Aceite os termos para continuar","error");return}const n=u();document.body.appendChild(n);try{await v.register({name:s,email:o,password:i}),window.location.hash="/verify-email"}catch(l){a(l instanceof g?l.message:"Erro no cadastro","error")}finally{n.remove()}})}export{q as mount,C as render};
