// src/screens/conta/sobre.ts — #/sobre: o que é o Salvee, versão, termos e privacidade (spec 20)
import { PageHeader } from '@/components'
import versoes from '@/config/versoes.json'
import { EMPRESA } from '@/config/empresa'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.appendChild(PageHeader('Sobre o Salvee'))
  const box = document.createElement('div')
  box.className = 'p-4 pb-24 flex flex-col gap-4'
  box.innerHTML = `
    <div class="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3 text-center">
      <img src="/icons/salvee-192.png" alt="" class="w-16 h-16 rounded-2xl" />
      <p class="text-lg font-bold text-salvee-orange">Salvee</p>
      <p class="text-sm text-gray-600">Conecta quem quer ajudar a instituições sociais: descubra causas, doe, participe de eventos e ganhe recompensas por fazer o bem. Instituições que recebem menos atenção ganham mais destaque.</p>
      <p id="about-version" class="text-xs text-gray-400"></p>
    </div>
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <a href="#/termos" class="flex items-center justify-between px-4 py-4 text-sm font-medium text-gray-700">Termos de uso <span class="text-gray-300">›</span></a>
      <a href="#/privacidade" class="flex items-center justify-between px-4 py-4 text-sm font-medium text-gray-700 border-t border-gray-50">Política de privacidade <span class="text-gray-300">›</span></a>
      <a href="#/ajuda" class="flex items-center justify-between px-4 py-4 text-sm font-medium text-gray-700 border-t border-gray-50">Centro de ajuda <span class="text-gray-300">›</span></a>
    </div>
    <p id="about-owner" class="text-center text-xs text-gray-400"></p>
  `
  el.appendChild(box)
  return el
}

export function mount(): void {
  const atual = versoes.historico[0]
  const data = atual?.data ? atual.data.split('-').reverse().join('/') : ''
  document.getElementById('about-version')!.textContent = `Versão ${versoes.versaoAtual}${data ? ` · ${data}` : ''}`
  const owner = [EMPRESA.razaoSocial, EMPRESA.cnpj && `CNPJ ${EMPRESA.cnpj}`].filter(Boolean).join(' · ')
  document.getElementById('about-owner')!.textContent = owner
}
