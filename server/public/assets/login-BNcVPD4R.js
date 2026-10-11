import{B as c}from"./Button-kVf4TgMB.js";import{I as n,g as l}from"./Input-B4RMibzo.js";import{L as m}from"./Spinner-u1aW0YGE.js";import{s as t}from"./Toast-BQaWcss2.js";import{S as p}from"./SocialLogin-WI7nIOvK.js";import{g,a as u,A as f}from"./index-yXmi89s3.js";import{g as v}from"./after-login-DNluOtIJ.js";import"./institution.service-BbAe5x50.js";function S(){const e=document.createElement("div");return e.className="screen bg-white",e.innerHTML=`
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
      <div id="social-section" class="hidden">
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400">ou entre com</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>
        <div id="social-buttons"></div>
      </div>
      <p class="text-center text-sm text-gray-500 mt-6">
        Não tem conta? <a href="#/register" class="text-salvee-orange font-medium">Cadastre-se</a>
      </p>
    </div>
  `,e}function C(){document.getElementById("back-btn").addEventListener("click",()=>history.back());const e=document.getElementById("login-form");e.querySelector("#field-email").appendChild(n({id:"email",label:"E-mail",type:"email",placeholder:"seu@email.com",required:!0})),e.querySelector("#field-password").appendChild(n({id:"password",label:"Senha",type:"password",placeholder:"••••••••",required:!0})),document.getElementById("btn-login").appendChild(c({label:"Entrar",variant:"primary",fullWidth:!0,type:"submit"})),document.getElementById("social-buttons").appendChild(p("Entrar",document.getElementById("social-section")));const r=g().get("erro");r&&(t(r,"error"),history.replaceState(null,"","#/login")),e.addEventListener("submit",async d=>{d.preventDefault();const a=l(e,"email"),o=l(e,"password");if(!a||!o){t("Preencha todos os campos","error");return}const s=m();document.body.appendChild(s);try{await u.login({email:a,password:o}),await v()}catch(i){t(i instanceof f?i.message:"Erro ao entrar","error")}finally{s.remove()}})}export{C as mount,S as render};
