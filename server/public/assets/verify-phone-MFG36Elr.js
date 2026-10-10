import{B as f}from"./Button-kVf4TgMB.js";import{L as g}from"./Spinner-u1aW0YGE.js";import{s as c}from"./Toast-Drk6oq-5.js";import{a as m,A as u}from"./index-CtecTLfR.js";let i="",h="input";function w(){const e=document.createElement("div");return e.className="screen bg-white",e.innerHTML=`
    <div class="flex items-center p-4 border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
    </div>
    <div id="step-content" class="flex-1 p-6 flex flex-col items-center text-center gap-6">
      <div class="w-20 h-20 bg-salvee-orange-bg rounded-full flex items-center justify-center text-4xl">📱</div>
    </div>
  `,e}function k(){document.getElementById("back-btn").addEventListener("click",()=>history.back()),x()}function x(){const e=document.getElementById("step-content"),v=e.querySelector(".text-4xl");for(;e.lastChild!==v;)e.removeChild(e.lastChild);if(h==="input"){const l=document.createElement("div");l.innerHTML=`
      <h1 class="text-2xl font-bold text-gray-900">Verifique seu número</h1>
      <p class="text-gray-500 text-sm mt-2">Preencha o campo abaixo com o seu país de origem seguido do número de celular.</p>
    `,e.appendChild(l);const r=document.createElement("div");r.className="flex gap-2 w-full",r.innerHTML=`
      <select class="px-3 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base">
        <option>🇧🇷 +55</option>
      </select>
      <input id="phone-input" type="tel" placeholder="(92) 99999-9999"
        class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base outline-none focus:border-salvee-orange" />
    `,e.appendChild(r);const a=document.createElement("div");a.className="w-full",a.appendChild(f({label:"Enviar",variant:"primary",fullWidth:!0,onClick:async()=>{if(i=document.getElementById("phone-input").value,!i){c("Digite seu telefone","error");return}const d=g();document.body.appendChild(d);try{await m.sendPhoneCode(i),h="code",x()}catch(o){c(o instanceof u?o.message:"Erro ao enviar código","error")}finally{d.remove()}}})),e.appendChild(a)}else{const l=document.createElement("div");l.innerHTML=`
      <h1 class="text-2xl font-bold text-gray-900">Código de verificação</h1>
    `;const r=document.createElement("p");r.className="text-gray-500 text-sm mt-2",r.textContent=`Insira o código que foi enviado para o número +55 ${i}`,l.appendChild(r),e.appendChild(l);const a=document.createElement("div");a.className="flex gap-2 justify-center";for(let t=0;t<4;t++){const n=document.createElement("input");n.id=`otp-${t}`,n.type="tel",n.maxLength=1,n.className="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-gray-200 outline-none focus:border-salvee-orange",n.addEventListener("input",()=>{n.value&&t<3&&document.getElementById(`otp-${t+1}`).focus()}),a.appendChild(n)}e.appendChild(a);const d=document.createElement("div");d.className="w-full",d.appendChild(f({label:"Enviar",variant:"primary",fullWidth:!0,onClick:async()=>{const t=[0,1,2,3].map(p=>document.getElementById(`otp-${p}`).value).join("");if(t.length!==4){c("Digite o código completo","error");return}const n=g();document.body.appendChild(n);try{await m.verifyPhone(i,t),window.location.hash="/welcome-success"}catch(p){c(p instanceof u?p.message:"Código inválido","error")}finally{n.remove()}}})),e.appendChild(d);const o=document.createElement("button");o.type="button",o.className="text-salvee-orange text-sm font-medium",o.textContent="Reenviar SMS",o.addEventListener("click",async()=>{try{await m.sendPhoneCode(i),c("Novo código enviado!","success")}catch(t){c(t instanceof u?t.message:"Erro ao reenviar o código","error")}}),e.appendChild(o)}const s=document.createElement("button");s.type="button",s.className="text-gray-400 text-sm font-medium underline",s.textContent="Pular por enquanto",s.addEventListener("click",()=>{window.location.hash="/welcome-success"}),e.appendChild(s)}function L(){h="input",i=""}export{k as mount,w as render,L as unmount};
