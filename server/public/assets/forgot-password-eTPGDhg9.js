import{B as n}from"./Button-kVf4TgMB.js";import{I as s,g as l}from"./Input-B4RMibzo.js";import{L as m}from"./Spinner-u1aW0YGE.js";import{s as t}from"./Toast-BQaWcss2.js";import{a as d,A as c}from"./index-o7HDIahN.js";function h(){const e=document.createElement("div");return e.className="screen bg-white",e.innerHTML=`
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold ml-2">Esqueci minha senha</h1>
    </div>
    <div class="flex-1 p-6 flex flex-col gap-6">
      <p class="text-gray-500 text-sm">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
      <form id="forgot-form" class="flex flex-col gap-4">
        <div id="field-email"></div>
        <div id="btn-send"></div>
      </form>
    </div>
  `,e}function b(){document.getElementById("back-btn").addEventListener("click",()=>history.back());const e=document.getElementById("forgot-form");e.querySelector("#field-email").appendChild(s({id:"email",label:"E-mail",type:"email",placeholder:"seu@email.com",required:!0})),document.getElementById("btn-send").appendChild(n({label:"Enviar link",variant:"primary",fullWidth:!0,type:"submit"})),e.addEventListener("submit",async o=>{o.preventDefault();const a=l(e,"email");if(!a){t("Digite seu e-mail","error");return}const i=m();document.body.appendChild(i);try{await d.forgotPassword(a),t("Se o e-mail estiver cadastrado, enviamos um link. Veja também a caixa de spam.","success",5e3),setTimeout(()=>{window.location.hash="/login"},3e3)}catch(r){t(r instanceof c?r.message:"Erro ao enviar. Tente novamente.","error")}finally{i.remove()}})}export{b as mount,h as render};
