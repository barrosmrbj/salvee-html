// src/screens/conta/ajuda.ts — #/ajuda: perguntas frequentes e contato (spec 20)
import { PageHeader } from '@/components'
import { EMPRESA, campo } from '@/config/empresa'

const FAQ: Array<[string, string]> = [
  ['Como faço uma doação?', 'Abra a instituição ou a campanha e toque em "Doar". Escolha o valor e pague com PIX. A doação aparece no seu histórico como pendente até ser confirmada.'],
  ['Por que minha doação está pendente?', 'Toda doação é conferida antes de ser confirmada. Depois da confirmação, os pontos (XP e Salves) entram na sua conta.'],
  ['O que são XP e Salves?', 'XP mostra o seu nível de participação. Salves são pontos que você troca por recompensas na aba Prêmios. Eles não são dinheiro e não podem ser vendidos nem transferidos.'],
  ['Como uso uma recompensa?', 'Na aba Prêmios → Minhas recompensas, abra a recompensa e mostre o QR Code no parceiro. Cada código vale uma vez e tem validade.'],
  ['Como participo de um evento?', 'Toque em "Participar" na publicação do evento. Ele entra na sua Agenda.'],
  ['Como cadastro minha instituição?', 'Em Configurações → Cadastrar minha instituição. Preencha as etapas e toque em "Enviar para análise". A equipe confere e avisa se precisar corrigir algo.'],
  ['Esqueci minha senha', 'Na tela de entrada, toque em "Esqueci minha senha" e siga o link enviado para o seu e-mail.'],
  ['Como excluo minha conta?', 'Em Configurações → Segurança → Excluir conta. A exclusão é definitiva.'],
  ['Encontrei algo errado ou suspeito', 'Fale com o suporte pelo e-mail abaixo, contando o que aconteceu e, se possível, o nome da instituição ou publicação.'],
]

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.appendChild(PageHeader('Centro de ajuda'))
  const box = document.createElement('div')
  box.className = 'p-4 pb-24 flex flex-col gap-3'

  const list = document.createElement('div')
  list.className = 'bg-white rounded-2xl border border-gray-100 overflow-hidden'
  FAQ.forEach(([q, a], i) => {
    const item = document.createElement('details')
    item.className = `group ${i ? 'border-t border-gray-50' : ''}`
    const summary = document.createElement('summary')
    summary.className = 'px-4 py-4 text-sm font-medium text-gray-800 cursor-pointer list-none flex justify-between gap-3'
    summary.textContent = q
    const arrow = document.createElement('span')
    arrow.className = 'text-gray-300 group-open:rotate-90 transition-transform'
    arrow.textContent = '›'
    summary.appendChild(arrow)
    const answer = document.createElement('p')
    answer.className = 'px-4 pb-4 text-sm text-gray-600'
    answer.textContent = a
    item.append(summary, answer)
    list.appendChild(item)
  })

  const contact = document.createElement('div')
  contact.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-1 text-sm'
  const title = document.createElement('p')
  title.className = 'font-semibold text-gray-900'
  title.textContent = 'Fale com a gente'
  const email = document.createElement(EMPRESA.emailContato ? 'a' : 'p')
  if (email instanceof HTMLAnchorElement) email.href = `mailto:${EMPRESA.emailContato}`
  email.className = 'text-salvee-orange break-all'
  email.textContent = campo(EMPRESA.emailContato, 'e-mail de contato')
  contact.append(title, email)

  box.append(list, contact)
  el.appendChild(box)
  return el
}
