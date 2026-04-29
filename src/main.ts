import '@/styles/global.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="p-4">
    <h1 class="text-2xl font-bold text-salvee-orange">Salvee</h1>
    <p class="text-gray-600 mt-2">Tailwind funcionando!</p>
    <div class="mt-4 p-4 bg-salvee-orange-bg rounded-2xl">
      <p class="text-salvee-orange font-semibold">Tokens de cor OK</p>
    </div>
  </div>
`
