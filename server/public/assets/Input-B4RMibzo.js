function x(t){const{id:r,label:e,type:o="text",placeholder:s="",value:c="",error:l,required:i,onInput:d}=t,n=document.createElement("div");if(n.className="flex flex-col gap-1",n.innerHTML=`
    <label for="${r}" class="text-sm font-medium text-gray-700">
      ${e}${i?' <span class="text-red-500">*</span>':""}
    </label>
    <input
      id="${r}"
      type="${o}"
      placeholder="${s}"
      value="${c}"
      class="w-full px-4 py-3 rounded-xl border ${l?"border-red-400 bg-red-50":"border-gray-200 bg-white"} text-gray-900 text-base outline-none focus:border-salvee-orange transition-colors"
    />
  `,o==="password"&&h(n.querySelector("input")),l){const a=document.createElement("span");a.className="text-xs text-red-500",a.textContent=l,n.appendChild(a)}if(d){const a=n.querySelector("input");a.addEventListener("input",()=>d(a.value))}return n}const u='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',p='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';function h(t){const r=document.createElement("div");r.className="relative",t.replaceWith(r),r.appendChild(t),t.classList.add("pr-12");const e=document.createElement("button");e.type="button",e.className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600";const o=()=>{const s=t.type==="text";e.innerHTML=s?p:u,e.setAttribute("aria-label",s?"Ocultar senha":"Mostrar senha"),e.title=s?"Ocultar senha":"Mostrar senha"};e.addEventListener("click",()=>{t.type=t.type==="password"?"text":"password",o(),t.focus()}),o(),r.appendChild(e)}function g(t,r){var e;return((e=t.querySelector(`#${r}`))==null?void 0:e.value)??""}export{x as I,g};
