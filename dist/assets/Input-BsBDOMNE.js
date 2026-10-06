function p(a){const{id:r,label:n,type:s="text",placeholder:u="",value:d="",error:l,required:c,onInput:o}=a,t=document.createElement("div");if(t.className="flex flex-col gap-1",t.innerHTML=`
    <label for="${r}" class="text-sm font-medium text-gray-700">
      ${n}${c?' <span class="text-red-500">*</span>':""}
    </label>
    <input
      id="${r}"
      type="${s}"
      placeholder="${u}"
      value="${d}"
      class="w-full px-4 py-3 rounded-xl border ${l?"border-red-400 bg-red-50":"border-gray-200 bg-white"} text-gray-900 text-base outline-none focus:border-salvee-orange transition-colors"
    />
  `,l){const e=document.createElement("span");e.className="text-xs text-red-500",e.textContent=l,t.appendChild(e)}if(o){const e=t.querySelector("input");e.addEventListener("input",()=>o(e.value))}return t}function i(a,r){var n;return((n=a.querySelector(`#${r}`))==null?void 0:n.value)??""}export{p as I,i as g};
