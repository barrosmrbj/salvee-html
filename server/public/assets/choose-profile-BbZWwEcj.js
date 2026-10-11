import{s as o}from"./Toast-BQaWcss2.js";import{a as s}from"./index-CF8eeLAn.js";import{u as a}from"./user.service-BEYcoCRI.js";import{b as r}from"./inicio-CiJa2TG1.js";function p(){const e=document.createElement("div");return e.className="screen",e.style.cssText=`background-image: url(${r}); background-size: cover; background-position: center;`,e.innerHTML=`
    <div class="absolute inset-0 bg-[#FF6B00]/60"></div>
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white mb-2">Qual é o seu perfil?</h1>
        <p class="text-white/80 text-sm">Escolha o tipo de conta para continuar</p>
      </div>
      <div id="profile-options" class="w-full flex flex-col gap-4"></div>
    </div>
  `,e}function m(){const e=document.getElementById("profile-options");if(!s.isAuthenticated()){window.location.replace("#/register");return}[{title:"Usuário",description:"Quero ajudar e acompanhar causas.",hash:"/feed",icon:"👤",type:"user"},{title:"Instituição",description:"Sou uma instituição e quero divulgar meu trabalho.",hash:"/register/institution",icon:"🏢",type:"institution"}].forEach(i=>{const t=document.createElement("button");t.type="button",t.className="w-full p-5 rounded-2xl bg-white/95 border-2 border-transparent hover:border-white text-left transition-colors shadow-md",t.innerHTML=`
      <div class="flex items-start gap-4">
        <span class="text-3xl">${i.icon}</span>
        <div>
          <h3 class="font-semibold text-gray-900 mb-1">${i.title}</h3>
          <p class="text-sm text-gray-500">${i.description}</p>
        </div>
      </div>
    `,t.addEventListener("click",async()=>{t.disabled=!0;try{await a.updateProfile({accountType:i.type})}catch{o("Não foi possível salvar a escolha, mas você pode continuar","info")}window.location.hash=i.hash}),e.appendChild(t)})}export{m as mount,p as render};
