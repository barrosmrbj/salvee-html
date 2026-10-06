import{B as c}from"./Button-kVf4TgMB.js";import{I as i,g as n}from"./Input-BsBDOMNE.js";import{L as m}from"./Spinner-u1aW0YGE.js";import{s as l}from"./Toast-Drk6oq-5.js";import{a as p,A as b}from"./index-UB3NMb3m.js";function y(){const e=document.createElement("div");return e.className="screen bg-white",e.innerHTML=`
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
    </div>
    <div class="flex-1 p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Entrar</h1>
      <p class="text-gray-500 text-sm mb-8">Acesse sua conta Salvee</p>
      <form id="login-form" class="flex flex-col gap-4">
        <div id="field-email"></div>
        <div id="field-password"></div>
        <a href="#/forgot-password" class="text-salvee-orange text-sm font-medium text-right self-end">Esqueci minha senha</a>
        <div id="btn-login" class="mt-2"></div>
      </form>
      <div class="flex items-center gap-3 my-6">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="text-xs text-gray-400">ou entre com</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      <div id="social-buttons" class="flex gap-3 justify-center"></div>
      <p class="text-center text-sm text-gray-500 mt-6">
        Não tem conta? <a href="#/register" class="text-salvee-orange font-medium">Cadastre-se</a>
      </p>
    </div>
  `,e}function w(){document.getElementById("back-btn").addEventListener("click",()=>history.back());const e=document.getElementById("login-form");e.querySelector("#field-email").appendChild(i({id:"email",label:"E-mail",type:"email",placeholder:"seu@email.com",required:!0})),e.querySelector("#field-password").appendChild(i({id:"password",label:"Senha",type:"password",placeholder:"••••••••",required:!0})),document.getElementById("btn-login").appendChild(c({label:"Entrar",variant:"primary",fullWidth:!0,type:"submit"}));const d=document.getElementById("social-buttons");[{label:"Apple",bg:"bg-black text-white",icon:"🍎"},{label:"Google",bg:"bg-white border border-gray-200 text-gray-700",icon:"G"},{label:"Facebook",bg:"bg-blue-600 text-white",icon:"f"}].forEach(a=>{const t=document.createElement("button");t.type="button",t.className=`w-14 h-14 rounded-2xl ${a.bg} flex items-center justify-center text-lg font-bold`,t.title=`Entrar com ${a.label}`,t.textContent=a.icon,d.appendChild(t)}),e.addEventListener("submit",async a=>{a.preventDefault();const t=n(e,"email"),r=n(e,"password");if(!t||!r){l("Preencha todos os campos","error");return}const o=m();document.body.appendChild(o);try{await p.login({email:t,password:r}),window.location.hash="/feed"}catch(s){l(s instanceof b?s.message:"Erro ao entrar","error")}finally{o.remove()}})}export{w as mount,y as render};
