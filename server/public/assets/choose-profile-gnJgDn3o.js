import{a as s}from"./index-CZegY-1j.js";import{b as n}from"./inicio-CiJa2TG1.js";function l(){const e=document.createElement("div");return e.className="screen",e.style.cssText=`background-image: url(${n}); background-size: cover; background-position: center;`,e.innerHTML=`
    <div class="absolute inset-0 bg-[#FF6B00]/60"></div>
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white mb-2">Qual é o seu perfil?</h1>
        <p class="text-white/80 text-sm">Escolha o tipo de conta para continuar</p>
      </div>
      <div id="profile-options" class="w-full flex flex-col gap-4"></div>
    </div>
  `,e}function d(){const e=document.getElementById("profile-options"),o=s.isAuthenticated();[{title:"Usuário",description:"Quero ajudar e acompanhar causas.",hash:o?"/feed":"/register?tipo=usuario",icon:"👤"},{title:"Instituição",description:"Sou uma instituição e quero divulgar meu trabalho.",hash:o?"/register/institution":"/register?tipo=instituicao",icon:"🏢"}].forEach(i=>{const t=document.createElement("button");t.type="button",t.className="w-full p-5 rounded-2xl bg-white/95 border-2 border-transparent hover:border-white text-left transition-colors shadow-md",t.innerHTML=`
      <div class="flex items-start gap-4">
        <span class="text-3xl">${i.icon}</span>
        <div>
          <h3 class="font-semibold text-gray-900 mb-1">${i.title}</h3>
          <p class="text-sm text-gray-500">${i.description}</p>
        </div>
      </div>
    `,t.addEventListener("click",()=>{window.location.hash=i.hash}),e.appendChild(t)})}export{d as mount,l as render};
