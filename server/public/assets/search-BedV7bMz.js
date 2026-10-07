import{S as h}from"./Spinner-u1aW0YGE.js";import{s as v}from"./Toast-Drk6oq-5.js";import{B as x}from"./BottomNav-sQ4bCqJt.js";import{r as i}from"./index-P7BUHYx0.js";const f={async search(e){return i(`/search?q=${encodeURIComponent(e)}`)},async listCategories(){return i("/categories")},async getNearby(e,t){return i(`/institutions/nearby?lat=${e}&lng=${t}`)}},b=[{title:"Promoções & metas do dia 5",subtitle:"Doe hoje e ganhe o dobro de Salves",progress:60,image:"/promos/promo-dia5.svg"},{title:"Campanha de Inverno",subtitle:"Agasalhos para famílias em vulnerabilidade",progress:35,image:"/promos/promo-inverno.svg"},{title:"Desafio 100 Doadores",subtitle:"Juntos somos mais fortes!",progress:82,image:"/promos/promo-100.svg"}],c=[{id:"inst-lar-sao-jose",name:"Lar São José",logoUrl:"/logos/lar-sao-jose.svg"},{id:"inst-casa-esperanca",name:"Casa Esperança",logoUrl:"/logos/casa-esperanca.svg"},{id:"inst-ong-raizes",name:"ONG Raízes",logoUrl:"/logos/ong-raizes.svg"},{id:"inst-proj-sementes",name:"Projeto Sementes",logoUrl:"/logos/proj-sementes.svg"},{id:"inst-instituto-luz",name:"Instituto Luz",logoUrl:"/logos/instituto-luz.svg"}],u=[{id:"c1",institutionId:"inst3",category:"Reforma",title:"Reforma da Igreja",institution:"ONG Verde",distance:"1,2 km"},{id:"c2",institutionId:"inst2",category:"Saúde",title:"Medicamentos para idosos",institution:"Lar dos Idosos Felizes",distance:"2,5 km"},{id:"c3",institutionId:"inst1",category:"Educação",title:"Material escolar 2025",institution:"Instituto Esperança",distance:"3,8 km"}],y=["Todos","Saúde","Crianças","Idosos","Educação","Animais"];function T(){const e=document.createElement("div");return e.className="screen bg-gray-50",e.innerHTML=`
    <header class="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-30">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-input" type="search" placeholder="Procure uma instituição" class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-salvee-orange/30 transition-all" />
      </div>
    </header>

    <div class="flex-1 overflow-y-auto pb-24">
      <div id="search-results" class="hidden p-4 flex flex-col gap-3"></div>

      <div id="discovery-content">
        <!-- Promoções carousel -->
        <div class="px-4 pt-4">
          <div id="promo-track" class="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"></div>
          <div id="promo-dots" class="flex justify-center gap-1.5 mt-2"></div>
        </div>

        <!-- Destaques -->
        <div class="mt-5">
          <div class="flex items-center justify-between px-4 mb-3">
            <span class="text-base font-bold text-gray-900">Destaques</span>
            <button class="text-xs font-semibold text-salvee-orange">Veja todos</button>
          </div>
          <div id="destaques-list" class="flex gap-4 overflow-x-auto px-4 pb-1 scrollbar-hide"></div>
        </div>

        <!-- Causas perto de você -->
        <div class="mt-5">
          <div class="flex items-center justify-between px-4 mb-3">
            <span class="text-base font-bold text-gray-900">Causas perto de você</span>
            <button id="filter-btn" class="flex items-center gap-1 text-gray-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><polyline points="7 18 3 14 7 10"/></svg>
            </button>
          </div>
          <div id="filter-chips" class="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide"></div>
          <div id="causas-list" class="flex flex-col gap-0 px-4"></div>
        </div>
      </div>
    </div>
  `,e}function j(){document.getElementById("app").appendChild(x()),w(),E(),C(),p(null);let e;document.getElementById("search-input").addEventListener("input",t=>{clearTimeout(e);const s=t.target.value.trim();e=setTimeout(()=>k(s),400)})}function w(){const e=document.getElementById("promo-track"),t=document.getElementById("promo-dots");b.forEach((s,o)=>{const n=document.createElement("div");n.className="flex-shrink-0 w-[calc(100vw-2rem)] max-w-sm snap-start rounded-2xl overflow-hidden relative h-40",n.innerHTML=`
      <img src="${s.image}" alt="${s.title}" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
        <p class="text-white font-bold text-lg leading-tight">${s.title}</p>
        <p class="text-white/80 text-xs mt-0.5">${s.subtitle}</p>
        <div class="mt-2 h-1 rounded-full bg-white/30 overflow-hidden">
          <div class="h-full bg-salvee-orange rounded-full" style="width:${s.progress}%"></div>
        </div>
      </div>
    `,e.appendChild(n);const r=document.createElement("div");r.className=`w-2 h-2 rounded-full transition-colors ${o===0?"bg-salvee-orange":"bg-gray-300"}`,r.dataset.index=String(o),t.appendChild(r)}),e.addEventListener("scroll",()=>{const s=Math.round(e.scrollLeft/e.clientWidth);t.querySelectorAll("div").forEach((o,n)=>{o.className=`w-2 h-2 rounded-full transition-colors ${n===s?"bg-salvee-orange":"bg-gray-300"}`})})}function E(){const e=document.getElementById("destaques-list");i("/institutions/destaques").then(t=>m(e,t.length?t:c)).catch(()=>m(e,c))}function m(e,t){e.innerHTML="",t.forEach(s=>{const o=document.createElement("div");o.className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer";const n=s.logoUrl?`<img src="${s.logoUrl}" alt="${s.name}" class="w-full h-full object-cover" />`:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';o.innerHTML=`
      <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
        ${n}
      </div>
      <span class="text-xs text-gray-700 text-center w-16 truncate">${s.name}</span>
    `,o.addEventListener("click",()=>{window.location.hash=`/institution/${s.id}`}),e.appendChild(o)})}let g=null;function C(){const e=document.getElementById("filter-chips");y.forEach(t=>{const s=document.createElement("button");s.dataset.filter=t,s.className=`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${t==="Todos"?"bg-salvee-orange text-white border-salvee-orange":"bg-white text-gray-600 border-gray-200"}`,s.textContent=t,s.addEventListener("click",()=>{g=t==="Todos"?null:t,e.querySelectorAll("button").forEach(o=>{const n=o.dataset.filter===t;o.className=`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${n?"bg-salvee-orange text-white border-salvee-orange":"bg-white text-gray-600 border-gray-200"}`}),p(g)}),e.appendChild(s)})}function p(e){const t=document.getElementById("causas-list");t.innerHTML="";const s=e?u.filter(o=>o.category===e):u;if(s.length===0){t.innerHTML='<p class="text-xs text-gray-400 py-4 text-center">Nenhuma causa nesta categoria.</p>';return}s.forEach(o=>{const n=document.createElement("div");n.className="flex items-center gap-3 bg-white rounded-xl p-3 mb-2 shadow-sm border border-gray-100 cursor-pointer",n.innerHTML=`
      <div class="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-5 4 5"/></svg>
      </div>
      <div class="flex-1 min-w-0">
        <span class="text-xs text-salvee-orange font-semibold">${o.category}</span>
        <p class="text-sm font-semibold text-gray-900 truncate">${o.title}</p>
        <p class="text-xs text-gray-400 truncate">${o.institution} · ${o.distance}</p>
      </div>
      <button class="text-gray-300 flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
    `,n.addEventListener("click",()=>{window.location.hash=`/institution/${o.institutionId}`}),t.appendChild(n)})}async function k(e){const t=document.getElementById("search-results"),s=document.getElementById("discovery-content");if(!e){t.classList.add("hidden"),s.classList.remove("hidden");return}t.classList.remove("hidden"),s.classList.add("hidden"),t.innerHTML="",t.appendChild(h());try{const o=await f.search(e);if(t.innerHTML="",o.length===0){const n=document.createElement("p");n.className="text-center text-gray-400 py-8",n.textContent="Nenhum resultado encontrado.",t.appendChild(n)}else o.forEach(n=>t.appendChild(L(n)))}catch{t.innerHTML="",v("Erro na busca","error")}}function L(e){const t=document.createElement("button");t.className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 text-left hover:border-salvee-orange transition-colors";const s=document.createElement("div");if(s.className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400",e.logoUrl){const a=document.createElement("img");a.src=e.logoUrl,a.alt=e.name,a.className="w-full h-full object-cover",s.appendChild(a)}else s.textContent="🏢";t.appendChild(s);const o=document.createElement("div");o.className="flex-1 min-w-0";const n=document.createElement("div");n.className="flex items-center gap-1 mb-0.5";const r=document.createElement("span");if(r.className="font-semibold text-gray-900 text-sm truncate",r.textContent=e.name,n.appendChild(r),e.verified){const a=document.createElement("span");a.className="inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full flex-shrink-0",a.innerHTML='<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',n.appendChild(a)}o.appendChild(n);const l=document.createElement("span");l.className="text-xs text-gray-500",l.textContent=e.category,o.appendChild(l),t.appendChild(o);const d=document.createElement("div");return d.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300 flex-shrink-0"><path d="M9 18l6-6-6-6"/></svg>',t.appendChild(d),t.addEventListener("click",()=>{window.location.hash=`/institution/${e.id}`}),t}function B(){var e;(e=document.getElementById("bottom-nav"))==null||e.remove()}export{j as mount,T as render,B as unmount};
