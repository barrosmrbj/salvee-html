import{b as i}from"./inicio-CiJa2TG1.js";function a(){const e=document.createElement("div");return e.className="screen",e.style.cssText=`background-image: url(${i}); background-size: cover; background-position: center;`,e.innerHTML=`
    <div class="absolute inset-0 bg-[#FF6B00]/60"></div>
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white mb-2">Qual é o seu perfil?</h1>
        <p class="text-white/80 text-sm">Escolha o tipo de conta para continuar</p>
      </div>
      <div id="profile-options" class="w-full flex flex-col gap-4"></div>
    </div>
  `,e}function r(){const e=document.getElementById("profile-options");[{title:"Usuário",description:"Quero apoiar causas, fazer doações e participar de eventos.",hash:"/feed",icon:"👤"},{title:"Instituição",description:"Represento uma ONG, abrigo ou projeto social.",hash:"/register/institution",icon:"🏢"}].forEach(o=>{const t=document.createElement("button");t.type="button",t.className="w-full p-5 rounded-2xl bg-white/95 border-2 border-transparent hover:border-white text-left transition-colors shadow-md",t.innerHTML=`
      <div class="flex items-start gap-4">
        <span class="text-3xl">${o.icon}</span>
        <div>
          <h3 class="font-semibold text-gray-900 mb-1">${o.title}</h3>
          <p class="text-sm text-gray-500">${o.description}</p>
        </div>
      </div>
    `,t.addEventListener("click",()=>{window.location.hash=o.hash}),e.appendChild(t)})}export{r as mount,a as render};
