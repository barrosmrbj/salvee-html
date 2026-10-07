import{B as u}from"./Button-kVf4TgMB.js";import{L as h}from"./Spinner-u1aW0YGE.js";import{s as c}from"./Toast-Drk6oq-5.js";import{a as p,A as f}from"./index-DMMHqK23.js";let i="",m="input";function E(){const e=document.createElement("div");return e.className="screen bg-white",e.innerHTML=`
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
    </div>
    <div id="step-content" class="flex-1 p-6 flex flex-col items-center text-center gap-6">
      <div class="w-20 h-20 bg-salvee-orange-bg rounded-full flex items-center justify-center text-4xl">📱</div>
    </div>
  `,e}function w(){document.getElementById("back-btn").addEventListener("click",()=>history.back()),g()}function g(){const e=document.getElementById("step-content"),v=e.querySelector(".text-4xl");for(;e.lastChild!==v;)e.removeChild(e.lastChild);if(m==="input"){const l=document.createElement("div");l.innerHTML=`
      <h1 class="text-2xl font-bold text-gray-900">Verifique seu número</h1>
      <p class="text-gray-500 text-sm mt-2">Preencha o campo abaixo com o seu país de origem seguido do número de celular.</p>
    `,e.appendChild(l);const r=document.createElement("div");r.className="flex gap-2 w-full",r.innerHTML=`
      <select class="px-3 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base">
        <option>🇧🇷 +55</option>
      </select>
      <input id="phone-input" type="tel" placeholder="(92) 99999-9999"
        class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base outline-none focus:border-salvee-orange" />
    `,e.appendChild(r);const a=document.createElement("div");a.className="w-full",a.appendChild(u({label:"Enviar",variant:"primary",fullWidth:!0,onClick:async()=>{if(i=document.getElementById("phone-input").value,!i){c("Digite seu telefone","error");return}const d=h();document.body.appendChild(d);try{await p.sendPhoneCode(i),m="code",g()}catch(n){c(n instanceof f?n.message:"Erro ao enviar código","error")}finally{d.remove()}}})),e.appendChild(a)}else{const l=document.createElement("div");l.innerHTML=`
      <h1 class="text-2xl font-bold text-gray-900">Código de verificação</h1>
    `;const r=document.createElement("p");r.className="text-gray-500 text-sm mt-2",r.textContent=`Insira o código que foi enviado para o número +55 ${i}`,l.appendChild(r),e.appendChild(l);const a=document.createElement("div");a.className="flex gap-2 justify-center";for(let o=0;o<4;o++){const t=document.createElement("input");t.id=`otp-${o}`,t.type="tel",t.maxLength=1,t.className="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-gray-200 outline-none focus:border-salvee-orange",t.addEventListener("input",()=>{t.value&&o<3&&document.getElementById(`otp-${o+1}`).focus()}),a.appendChild(t)}e.appendChild(a);const d=document.createElement("div");d.className="w-full",d.appendChild(u({label:"Enviar",variant:"primary",fullWidth:!0,onClick:async()=>{const o=[0,1,2,3].map(s=>document.getElementById(`otp-${s}`).value).join("");if(o.length!==4){c("Digite o código completo","error");return}const t=h();document.body.appendChild(t);try{await p.verifyPhone(i,o),window.location.hash="/welcome-success"}catch(s){c(s instanceof f?s.message:"Código inválido","error")}finally{t.remove()}}})),e.appendChild(d);const n=document.createElement("button");n.type="button",n.className="text-salvee-orange text-sm font-medium",n.textContent="Reenviar SMS",n.addEventListener("click",async()=>{await p.sendPhoneCode(i),c("Novo código enviado!","success")}),e.appendChild(n)}}function L(){m="input",i=""}export{w as mount,E as render,L as unmount};
