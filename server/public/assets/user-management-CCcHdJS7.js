import{S as m}from"./Spinner-u1aW0YGE.js";import{s as a}from"./Toast-Drk6oq-5.js";import{a as p}from"./index-S9Gm1syd.js";import{a as u}from"./admin.service-D2bTjRbf.js";const g={user:"Usuário",gestor:"Gestor",admin:"Admin"},l={user:"bg-gray-100 text-gray-500",gestor:"bg-salvee-orange-bg text-salvee-orange",admin:"bg-gray-900 text-white"};let i,s=null;function w(){const e=document.createElement("div");return e.className="screen bg-gray-50",e.innerHTML=`
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Gerenciar Usuários</h1>
    </div>
    <div id="admin-guard-loading" class="flex justify-center py-16"></div>
    <div id="admin-content" class="hidden">
      <div class="px-4 py-3 flex flex-col gap-2">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="user-search" type="search" placeholder="Buscar por nome" class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:border-salvee-orange transition-colors" />
        </div>
        <button id="show-gestores-btn" class="self-start px-3 py-1.5 rounded-full text-xs font-semibold border border-salvee-orange/40 text-salvee-orange bg-white transition-colors">Ver gestores atuais</button>
      </div>
      <div id="users-list" class="flex flex-col gap-3 px-4 pb-24"></div>
    </div>
    <div id="admin-denied" class="hidden text-center py-20 px-6">
      <p class="text-4xl mb-3">🔒</p>
      <p class="text-gray-700 font-semibold">Acesso restrito</p>
      <p class="text-gray-400 text-sm mt-1">Esta área é exclusiva para administradores.</p>
    </div>
  `,e}function L(){document.getElementById("back-btn").addEventListener("click",()=>history.back());const e=document.getElementById("admin-guard-loading");e.appendChild(m()),p.getMe().then(r=>{if(e.remove(),r.role!=="admin"){document.getElementById("admin-denied").classList.remove("hidden");return}document.getElementById("admin-content").classList.remove("hidden"),c(),document.getElementById("user-search").addEventListener("input",t=>{clearTimeout(i);const n=t.target.value.trim();if(!n){s=null,c();return}i=setTimeout(()=>d({name:n}),400)}),document.getElementById("show-gestores-btn").addEventListener("click",()=>{document.getElementById("user-search").value="",d({role:"gestor"})})}).catch(()=>{e.remove(),document.getElementById("admin-denied").classList.remove("hidden")})}function c(){const e=document.getElementById("users-list");e.innerHTML='<p class="text-center text-gray-400 py-12 text-sm">Digite um nome para buscar usuários.</p>'}function d(e){s=e;const r=document.getElementById("users-list");r.innerHTML="";const t=document.createElement("div");t.className="flex justify-center py-8",t.appendChild(m()),r.appendChild(t),u.listUsers(e).then(n=>{t.remove(),x(n,e.role==="gestor"?"Nenhum gestor cadastrado ainda.":void 0)}).catch(()=>{t.remove(),a("Erro ao carregar usuários","error")})}function x(e,r="Nenhum usuário encontrado."){const t=document.getElementById("users-list");if(t.innerHTML="",e.length===0){const n=document.createElement("p");n.className="text-center text-gray-400 py-12 text-sm",n.textContent=r,t.appendChild(n);return}e.forEach(n=>t.appendChild(v(n)))}function v(e){const r=document.createElement("div");r.className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3";const t=document.createElement("div");if(t.className="flex-1 min-w-0",t.innerHTML=`
    <div class="flex items-center gap-2">
      <p class="font-semibold text-gray-900 text-sm truncate">${e.name}</p>
      <span class="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${l[e.role]??l.user}">${g[e.role]??e.role}</span>
    </div>
    <p class="text-xs text-gray-400 truncate mt-0.5">${e.email}</p>
  `,r.appendChild(t),e.role==="user"||e.role==="gestor"){const n=document.createElement("button"),o=e.role==="user";n.className=o?"flex-shrink-0 px-3 py-2 rounded-xl bg-salvee-orange text-white text-xs font-semibold active:scale-95 transition-transform":"flex-shrink-0 px-3 py-2 rounded-xl border border-red-300 text-red-500 text-xs font-semibold active:scale-95 transition-transform",n.textContent=o?"Tornar gestor":"Remover gestor",n.addEventListener("click",()=>y(e.id,o?"gestor":"user",r)),r.appendChild(n)}return r}async function y(e,r,t){t.style.opacity="0.5",t.style.pointerEvents="none";try{await u.updateUserRole(e,r),a(r==="gestor"?"Usuário promovido a gestor":"Gestor removido","success"),s&&d(s)}catch{t.style.opacity="1",t.style.pointerEvents="auto",a("Erro ao atualizar usuário","error")}}function B(){clearTimeout(i),s=null}export{L as mount,w as render,B as unmount};
