import{B as u}from"./Button-kVf4TgMB.js";import{I as a,g as o}from"./Input-BsBDOMNE.js";import{L as f}from"./Spinner-u1aW0YGE.js";import{s as i}from"./Toast-Drk6oq-5.js";import{a as g,A as b}from"./index-CNxEfz6J.js";function C(){const e=document.createElement("div");return e.className="screen bg-white overflow-y-auto",e.innerHTML=`
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold ml-2">Crie uma conta</h1>
    </div>
    <div class="p-6 flex flex-col gap-4">
      <p class="text-gray-500 text-sm">Preencha as informações abaixo ou registre-se com sua conta social</p>
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
      <div class="flex items-center gap-3 my-2">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="text-xs text-gray-400">ou crie a conta com</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      <div id="social-register" class="flex gap-3 justify-center"></div>
      <p class="text-center text-sm text-gray-500">Já tem uma conta? <a href="#/login" class="text-salvee-orange font-medium">Clique aqui</a></p>
    </div>
  `,e}function q(){document.getElementById("back-btn").addEventListener("click",()=>history.back());const e=document.getElementById("register-form");e.querySelector("#field-name").appendChild(a({id:"name",label:"Nome",placeholder:"Ex. José Lucas",required:!0})),e.querySelector("#field-email").appendChild(a({id:"email",label:"Email",type:"email",placeholder:"seuemail@gmail.com",required:!0})),e.querySelector("#field-password").appendChild(a({id:"password",label:"Senha",type:"password",placeholder:"••••••••",required:!0})),e.querySelector("#field-confirm").appendChild(a({id:"confirm",label:"Confirme a senha",type:"password",placeholder:"••••••••",required:!0})),document.getElementById("btn-register").appendChild(u({label:"Avançar",variant:"primary",fullWidth:!0,type:"submit"}));const d=document.getElementById("social-register");[{label:"Apple",bg:"bg-black text-white",icon:"🍎"},{label:"Google",bg:"bg-white border border-gray-200 text-gray-700",icon:"G"},{label:"Facebook",bg:"bg-blue-600 text-white",icon:"f"}].forEach(r=>{const t=document.createElement("button");t.type="button",t.className=`w-14 h-14 rounded-2xl ${r.bg} flex items-center justify-center text-lg font-bold`,t.title=r.label,t.textContent=r.icon,d.appendChild(t)}),e.addEventListener("submit",async r=>{r.preventDefault();const t=o(e,"name"),n=o(e,"email"),s=o(e,"password"),m=o(e,"confirm"),p=e.querySelector("#terms").checked;if(!t||!n||!s){i("Preencha todos os campos","error");return}if(s!==m){i("As senhas não coincidem","error");return}if(!p){i("Aceite os termos para continuar","error");return}const l=f();document.body.appendChild(l);try{await g.register({name:t,email:n,password:s}),window.location.hash="/verify-phone"}catch(c){i(c instanceof b?c.message:"Erro no cadastro","error")}finally{l.remove()}})}export{q as mount,C as render};
