import{B as l}from"./Button-kVf4TgMB.js";const n="/assets/__girl_salvee_003-RVYfMJxk.svg";function a(){const e=document.createElement("div");return e.className="screen bg-salvee-orange",e.innerHTML=`
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="flex flex-col items-center gap-6 text-center w-full">
        <img src="${n}" alt="Ilustração Salvee" class="w-48 h-48 object-contain" />
        <div>
          <h1 class="text-white text-4xl font-bold mb-2">Olá!</h1>
          <p class="text-white/80 text-base leading-relaxed">
            Ajudar nunca foi tão fácil. Grandes mudanças acontecem com pequenos cliques.
          </p>
        </div>
        <div id="welcome-actions" class="flex flex-col gap-3 w-full"></div>
      </div>
    </div>
  `,e}function i(){const e=document.getElementById("welcome-actions");e.appendChild(l({label:"Comece aqui",variant:"secondary",fullWidth:!0,onClick:()=>{window.location.hash="/choose-profile"}}));const t=l({label:"Já tenho uma conta",variant:"ghost",fullWidth:!0,onClick:()=>{window.location.hash="/login"}});t.classList.add("text-white","border","border-white/40","hover:bg-white/10"),e.appendChild(t)}export{i as mount,a as render};
