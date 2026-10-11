import{B as u}from"./Button-kVf4TgMB.js";import{I as t,g as i}from"./Input-B4RMibzo.js";import{L as f}from"./Spinner-u1aW0YGE.js";import{s as r}from"./Toast-BQaWcss2.js";import{S as v}from"./SocialLogin-CKnUXN20.js";import{a as g,A as h}from"./index-CpPucNuj.js";import{i as y,p as x,P as b}from"./validation-C8hqb11c.js";import{L as w}from"./empresa-BKpe8geV.js";function A(){const e=document.createElement("div");return e.className="screen bg-white overflow-y-auto",e.innerHTML=`
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
          <span>Li e concordo com os <a href="#/termos" target="_blank" rel="noopener" class="text-salvee-orange underline">Termos de uso</a> e a <a href="#/privacidade" target="_blank" rel="noopener" class="text-salvee-orange underline">Política de privacidade</a></span>
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
  `,e}function P(){document.getElementById("back-btn").addEventListener("click",()=>history.back());const e=document.getElementById("register-form");e.querySelector("#field-name").appendChild(t({id:"name",label:"Nome",placeholder:"Ex. José Lucas",required:!0})),e.querySelector("#field-email").appendChild(t({id:"email",label:"Email",type:"email",placeholder:"seuemail@gmail.com",required:!0})),e.querySelector("#field-password").appendChild(t({id:"password",label:"Senha",type:"password",placeholder:b,required:!0})),e.querySelector("#field-confirm").appendChild(t({id:"confirm",label:"Confirme a senha",type:"password",placeholder:"••••••••",required:!0})),document.getElementById("btn-register").appendChild(u({label:"Avançar",variant:"primary",fullWidth:!0,type:"submit"})),document.getElementById("social-register").appendChild(v("Cadastrar",document.getElementById("social-section"))),e.addEventListener("submit",async c=>{c.preventDefault();const o=i(e,"name"),s=i(e,"email"),a=i(e,"password"),m=i(e,"confirm"),p=e.querySelector("#terms").checked;if(!o||!s||!a){r("Preencha todos os campos","error");return}if(o.trim().length<2){r("Informe o seu nome","error");return}if(!y(s)){r("E-mail inválido. Confira se digitou certo.","error");return}const n=x(a);if(n){r(n,"error");return}if(a!==m){r("As senhas não coincidem","error");return}if(!p){r("Aceite os Termos de uso e a Política de privacidade para continuar","error");return}const l=f();document.body.appendChild(l);try{await g.register({name:o.trim(),email:s.trim(),password:a,acceptTerms:!0,termsVersion:w}),window.location.hash="/verify-email"}catch(d){r(d instanceof h?d.message:"Erro no cadastro","error")}finally{l.remove()}})}export{P as mount,A as render};
