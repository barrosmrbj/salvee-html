import{S}from"./Spinner-u1aW0YGE.js";import{B as D}from"./BottomNav-H00wEZmO.js";import{c as M}from"./calendar.service-VEmt2Z26.js";import"./index-CU9eUoaa.js";const I=["DOM","SEG","TER","QUA","QUI","SEX","SAB"],g=7,L=45,u=44;let c=[],d=null,m=null;function H(){const t=document.createElement("div");return t.className="screen bg-white",t.innerHTML=`
    <div class="overflow-y-auto pb-24">
      <header class="px-4 pt-5 pb-2">
        <h1 class="text-2xl font-extrabold text-gray-900">Próximas atividades</h1>
        <p id="month-summary" class="text-sm font-semibold text-salvee-orange mt-1"></p>
      </header>

      <div class="mx-4 mt-2 rounded-2xl border border-gray-100 shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <span id="strip-month-label" class="text-lg font-bold text-gray-900 capitalize"></span>
          <div class="flex items-center gap-2">
            <button id="strip-prev" class="w-7 h-7 flex items-center justify-center text-salvee-orange" aria-label="Semana anterior">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button id="strip-next" class="w-7 h-7 flex items-center justify-center text-salvee-orange" aria-label="Próxima semana">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div id="day-strip" class="flex gap-1 overflow-x-auto scrollbar-hide snap-x"></div>
      </div>

      <div id="filter-chips" class="flex gap-2 overflow-x-auto px-4 pt-4 pb-1 scrollbar-hide"></div>

      <div class="px-4 mt-3">
        <h2 class="text-base font-bold text-gray-900 mb-3">Eventos</h2>
        <div id="events-list" class="flex flex-col gap-3"></div>
      </div>
    </div>
  `,t}function Y(){document.getElementById("app").appendChild(D());const t=document.getElementById("events-list"),e=document.createElement("div");e.className="flex justify-center py-8",e.appendChild(S()),t.appendChild(e),document.getElementById("strip-prev").addEventListener("click",()=>x(-1)),document.getElementById("strip-next").addEventListener("click",()=>x(1)),document.getElementById("day-strip").addEventListener("scroll",y),M.getMyEvents().then(n=>{e.remove(),c=n,h()}).catch(()=>{e.remove(),c=k(),h()})}function h(){v(),b(),w(),B()}function B(){const t=new Date,e=c.filter(o=>{const a=new Date(o.date);return a.getFullYear()===t.getFullYear()&&a.getMonth()===t.getMonth()}).length,n=document.getElementById("month-summary");n.textContent=e===1?"1 evento confirmado este mês":`${e} eventos confirmados este mês`}function v(){const t=document.getElementById("day-strip");t.innerHTML="";const e=new Date;e.setHours(0,0,0,0);const n=new Date(e);n.setDate(n.getDate()-g);const o=new Set(c.map(s=>p(new Date(s.date)))),a=p(e);d||(d=a);for(let s=0;s<g+L;s++){const i=new Date(n);i.setDate(n.getDate()+s);const l=p(i),r=document.createElement("button");r.dataset.dateKey=l,r.className="flex-shrink-0 flex flex-col items-center gap-1.5 py-1 snap-start",r.style.width=`${u}px`;const E=l===d;r.innerHTML=`
      <span class="text-[10px] font-semibold text-gray-400">${I[i.getDay()]}</span>
      <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${E?"bg-salvee-orange text-white":"text-gray-800"}">${i.getDate()}</span>
      <span class="w-1 h-1 rounded-full ${o.has(l)?"bg-salvee-orange":"bg-transparent"}"></span>
    `,r.addEventListener("click",()=>{d=l,v(),f(!1)}),t.appendChild(r)}f(!0),y()}function f(t){const e=document.getElementById("day-strip"),n=e.querySelector(`[data-date-key="${d}"]`);if(!n)return;const o=n.offsetLeft-e.clientWidth/2+u/2;e.scrollTo({left:Math.max(0,o),behavior:t?"auto":"smooth"})}function x(t){document.getElementById("day-strip").scrollBy({left:t*u*7,behavior:"smooth"})}function y(){const t=document.getElementById("day-strip"),e=document.getElementById("strip-month-label"),n=t.scrollLeft+t.clientWidth/2;let o=null,a=1/0;t.querySelectorAll("[data-date-key]").forEach(l=>{const r=Math.abs(l.offsetLeft+u/2-n);r<a&&(a=r,o=l)});const s=o==null?void 0:o.dataset.dateKey;if(!s)return;const i=new Date(s);e.textContent=i.toLocaleDateString("pt-BR",{month:"long"})}function p(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function b(){const t=document.getElementById("filter-chips");t.innerHTML="",["Todos",...Array.from(new Set(c.map(o=>o.category).filter(o=>!!o)))].forEach(o=>{const a=document.createElement("button"),s=o==="Todos"&&m===null||o===m;a.className=`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${s?"bg-salvee-orange text-white border-salvee-orange":"bg-white text-salvee-orange border-salvee-orange/40"}`,a.textContent=o,a.addEventListener("click",()=>{m=o==="Todos"?null:o,b(),w()}),t.appendChild(a)})}function w(){const t=document.getElementById("events-list");t.innerHTML="";const e=m?c.filter(n=>n.category===m):c;if(e.length===0){const n=document.createElement("div");n.className="text-center py-16",n.innerHTML=`
      <p class="text-4xl mb-3">📅</p>
      <p class="text-gray-500 font-medium">Nenhum evento confirmado ainda</p>
      <p class="text-gray-400 text-sm mt-1">Explore o feed e participe de eventos!</p>
    `,t.appendChild(n);return}e.forEach(n=>t.appendChild($(n)))}function $(t){const e=document.createElement("button");e.className="w-full bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 text-left hover:border-salvee-orange/40 transition-colors",e.addEventListener("click",()=>{window.location.hash=`/institution/${t.institutionId}`});const n=document.createElement("div");n.className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center",n.innerHTML=t.imageUrl?`<img src="${t.imageUrl}" alt="" class="w-full h-full object-cover" />`:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',e.appendChild(n);const o=document.createElement("div");o.className="flex-1 min-w-0",o.innerHTML=`
    <p class="font-bold text-gray-900 text-sm truncate">${t.title}</p>
    <p class="text-xs text-gray-400 mt-0.5">${C(t.date)}</p>
    <p class="text-xs text-gray-400 truncate">${t.location}</p>
    ${t.category?`<p class="text-xs font-semibold text-salvee-orange mt-0.5">${t.category}</p>`:""}
  `,e.appendChild(o);const a=document.createElement("div");return a.className="flex-shrink-0",a.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300"><path d="M9 18l6-6-6-6"/></svg>',e.appendChild(a),e}function C(t){const e=new Date(t),n=String(e.getDate()).padStart(2,"0"),o=e.toLocaleDateString("pt-BR",{month:"short"}).replace(".","").toUpperCase(),a=e.getHours(),s=e.getMinutes(),i=s>0?`${a}h${String(s).padStart(2,"0")}`:`${a}h`;return`${n} ${o} - ${i}`}function k(){const t=new Date;return[{id:"1",institutionId:"inst3",institutionName:"ONG Verde",title:"Projeto Verônica",date:new Date(t.getFullYear(),t.getMonth(),t.getDate()+1,14,0).toISOString(),location:"Compensa, Manaus",registered:!0,category:"Social"},{id:"2",institutionId:"inst1",institutionName:"Instituto Esperança",title:"Terço Jovem",date:new Date(t.getFullYear(),t.getMonth(),t.getDate()+2,18,0).toISOString(),location:"Paróquia São José",registered:!0,category:"Evangelização"},{id:"3",institutionId:"inst2",institutionName:"Lar dos Idosos Felizes",title:"Almoço 28 de Agosto",date:new Date(t.getFullYear(),t.getMonth(),t.getDate()+3,11,0).toISOString(),location:"Compensa, Manaus",registered:!0,category:"Social"},{id:"4",institutionId:"inst1",institutionName:"Abrigo Meu Pet",title:"Feira de Adoção",date:new Date(t.getFullYear(),t.getMonth(),t.getDate()+5,9,0).toISOString(),location:"Praça da Saudade",registered:!0,category:"Abrigos"}]}function j(){var t;(t=document.getElementById("bottom-nav"))==null||t.remove(),d=null,m=null}export{Y as mount,H as render,j as unmount};
