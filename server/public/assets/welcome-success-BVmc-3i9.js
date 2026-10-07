import{B as t}from"./Button-kVf4TgMB.js";const s="/assets/__girl_salvee_006-CiH3godl.svg";function o(){const e=document.createElement("div");return e.className="screen bg-salvee-orange",e.innerHTML=`
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="flex flex-col items-center gap-8 text-center">
        <img src="${s}" alt="Bem-vindo ao Salvee" class="w-80 h-80 object-contain drop-shadow-lg" />
        <div class="flex flex-col gap-3">
          <h1 class="text-white text-3xl font-bold">Seja bem-vindo(a)!</h1>
          <p class="text-white/90 text-base leading-relaxed">
            <span class="font-semibold">Pronto!</span> Seu perfil está ativo.<br/>
            Agora você faz parte do Salvee.
          </p>
        </div>
        <div id="success-actions" class="w-full"></div>
      </div>
    </div>
  `,e}function l(){document.getElementById("success-actions").appendChild(t({label:"Continuar",variant:"secondary",fullWidth:!0,onClick:()=>{window.location.hash="/choose-profile"}}))}export{l as mount,o as render};
