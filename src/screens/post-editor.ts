// src/screens/post-editor.ts — criar (#/post/new?tipo=common|event|campaign) ou editar (#/post/:id/edit)
// uma publicação da instituição (spec 12). Só o responsável por instituição aprovada publica.
import { Button, Spinner, showToast, LoadingOverlay } from '@/components'
import { feedService, institutionService } from '@/services'
import { ApiError } from '@/services/api'
import { getHashQuery } from '@/router'
import type { MyInstitution, Post, PostPayload, PostType } from '@/types'

const MAX_IMAGES = 5
const TYPES: Array<{ id: PostType; label: string }> = [
  { id: 'common', label: 'Post' },
  { id: 'event', label: 'Evento' },
  { id: 'campaign', label: 'Campanha' },
]

let editingId: string | null = null
let type: PostType = 'common'
let images: string[] = []

const field = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base outline-none focus:border-salvee-orange transition-colors'
const label = 'text-sm font-medium text-gray-700'

export function render(params?: Record<string, string>): HTMLElement {
  editingId = params?.id ?? null
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 border-b border-gray-100 sticky top-0 bg-white z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">${editingId ? 'Editar publicação' : 'Nova publicação'}</h1>
    </div>
    <div id="editor" class="p-4 pb-28"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const root = document.getElementById('editor')!
  root.appendChild(Spinner())
  void load(root)
}

async function load(root: HTMLElement): Promise<void> {
  try {
    if (editingId) {
      const post = await feedService.getPostById(editingId)
      if (!post.canEdit) return showMessage(root, '🔒', 'Você não pode editar esta publicação.')
      type = post.type
      images = post.images?.length ? [...post.images] : (post.imageUrl ? [post.imageUrl] : [])
      buildForm(root, [], post)
      return
    }
    const mine = await institutionService.listMine()
    const approved = mine.filter(i => i.status === 'approved')
    if (!approved.length) {
      const text = mine.length
        ? 'Sua instituição ainda não foi aprovada. Assim que a equipe do Salvee aprovar, você poderá publicar.'
        : 'Somente instituições aprovadas podem publicar. Cadastre a sua instituição para começar.'
      return showMessage(root, '🏢', text)
    }
    const wanted = getHashQuery().get('tipo') as PostType | null
    type = TYPES.some(t => t.id === wanted) ? wanted! : 'common'
    images = []
    buildForm(root, approved, null)
  } catch (err) {
    showMessage(root, '⚠️', err instanceof ApiError ? err.message : 'Não foi possível carregar. Tente novamente.')
  }
}

function showMessage(root: HTMLElement, icon: string, text: string): void {
  root.innerHTML = ''
  const box = document.createElement('div')
  box.className = 'text-center py-16 px-4 flex flex-col items-center gap-3'
  const i = document.createElement('p')
  i.className = 'text-4xl'
  i.textContent = icon
  const p = document.createElement('p')
  p.className = 'text-gray-600 text-sm'
  p.textContent = text
  box.append(i, p)
  root.appendChild(box)
}

function buildForm(root: HTMLElement, institutions: MyInstitution[], post: Post | null): void {
  root.innerHTML = ''
  const form = document.createElement('form')
  form.className = 'flex flex-col gap-4'
  form.noValidate = true

  // instituição (só na criação; com uma só, mostra o nome)
  if (!post) {
    const wrap = group('Publicar como')
    if (institutions.length === 1) {
      const p = document.createElement('p')
      p.className = 'font-semibold text-gray-900'
      p.textContent = institutions[0].name
      p.dataset['institutionId'] = institutions[0].id
      p.id = 'institution'
      wrap.appendChild(p)
    } else {
      const select = document.createElement('select')
      select.id = 'institution'
      select.className = field
      institutions.forEach(i => {
        const o = document.createElement('option')
        o.value = i.id
        o.textContent = i.name
        select.appendChild(o)
      })
      wrap.appendChild(select)
    }
    form.appendChild(wrap)

    const chips = document.createElement('div')
    chips.className = 'flex gap-2'
    TYPES.forEach(t => {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.dataset['type'] = t.id
      chip.textContent = t.label
      chip.addEventListener('click', () => { type = t.id; syncType(form) })
      chips.appendChild(chip)
    })
    chips.id = 'type-chips'
    form.appendChild(chips)
  }

  form.appendChild(textField('title', 'Título', post?.title ?? '', 120))
  form.appendChild(textArea('content', 'Texto', post?.content ?? ''))

  // campanha
  const campaign = document.createElement('div')
  campaign.id = 'campaign-fields'
  campaign.className = 'flex flex-col gap-4'
  campaign.appendChild(inputField('goal', 'Meta (R$)', 'number', post?.campaignGoal ? String(post.campaignGoal) : '', 'Ex.: 5000'))
  campaign.appendChild(inputField('deadline', 'Prazo (opcional)', 'date', post?.campaignDeadline ?? ''))
  form.appendChild(campaign)

  // evento
  const event = document.createElement('div')
  event.id = 'event-fields'
  event.className = 'flex flex-col gap-4'
  const { date, time } = splitLocal(post?.eventDate)
  const row = document.createElement('div')
  row.className = 'grid grid-cols-2 gap-3'
  row.appendChild(inputField('event-date', 'Data', 'date', date))
  row.appendChild(inputField('event-time', 'Horário', 'time', time))
  event.appendChild(row)
  event.appendChild(textField('location', 'Local', post?.eventLocation ?? '', 200))
  event.appendChild(textArea('instructions', 'Instruções (opcional)', post?.eventInstructions ?? '', 'O que levar, como chegar…'))
  form.appendChild(event)

  form.appendChild(imagesField())

  const submit = document.createElement('div')
  submit.className = 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app p-4 pb-safe bg-white border-t border-gray-100'
  submit.appendChild(Button({ label: post ? 'Salvar' : 'Publicar', variant: 'primary', fullWidth: true, type: 'submit' }))
  form.appendChild(submit)

  form.addEventListener('submit', e => { e.preventDefault(); void save(form, post) })
  root.appendChild(form)
  syncType(form)
}

// mostra os campos do tipo escolhido (os valores dos outros ficam guardados no formulário)
function syncType(form: HTMLElement): void {
  form.querySelectorAll<HTMLButtonElement>('#type-chips [data-type]').forEach(chip => {
    const active = chip.dataset['type'] === type
    chip.className = `flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
      active ? 'bg-salvee-orange text-white border-salvee-orange' : 'bg-white text-gray-600 border-gray-200'
    }`
  })
  form.querySelector('#campaign-fields')!.classList.toggle('hidden', type !== 'campaign')
  form.querySelector('#event-fields')!.classList.toggle('hidden', type !== 'event')
  form.querySelector('label[for="title"]')!.textContent = type === 'common' ? 'Título (opcional)' : 'Título'
  form.querySelector('label[for="content"]')!.textContent = type === 'common' ? 'Texto' : 'Descrição'
}

async function save(form: HTMLElement, post: Post | null): Promise<void> {
  const val = (id: string) => ((form.querySelector(`#${id}`) as HTMLInputElement | null)?.value ?? '').trim()
  const payload: PostPayload = { title: val('title'), content: val('content'), images }

  if (!payload.content) return showToast('Escreva o texto da publicação', 'error')
  if (type === 'campaign') {
    if (!payload.title) return showToast('Informe o título da campanha', 'error')
    const goal = Number(val('goal'))
    if (!Number.isInteger(goal) || goal <= 0) return showToast('Informe a meta em reais (número inteiro)', 'error')
    payload.campaignGoal = goal
    payload.campaignDeadline = val('deadline') || undefined
  }
  if (type === 'event') {
    if (!payload.title) return showToast('Informe o título do evento', 'error')
    if (!val('event-date') || !val('event-time')) return showToast('Informe a data e o horário do evento', 'error')
    if (!val('location')) return showToast('Informe o local do evento', 'error')
    payload.eventDate = new Date(`${val('event-date')}T${val('event-time')}`).toISOString()
    payload.eventLocation = val('location')
    payload.eventInstructions = val('instructions') || undefined
  }

  const overlay = LoadingOverlay()
  document.body.appendChild(overlay)
  try {
    if (post) {
      await feedService.updatePost(post.id, payload)
      showToast('Publicação atualizada', 'success')
    } else {
      const inst = form.querySelector('#institution') as HTMLElement
      payload.institutionId = inst instanceof HTMLSelectElement ? inst.value : inst.dataset['institutionId']
      payload.type = type
      await feedService.createPost(payload)
      showToast('Publicado!', 'success')
    }
    window.location.hash = '/feed'
  } catch (err) {
    showToast(err instanceof ApiError ? err.message : 'Erro ao salvar. Tente novamente.', 'error')
  } finally {
    overlay.remove()
  }
}

function imagesField(): HTMLElement {
  const wrap = group(`Imagens (até ${MAX_IMAGES})`)
  const grid = document.createElement('div')
  grid.className = 'grid grid-cols-3 gap-2'
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/png'
  input.multiple = true
  input.className = 'hidden'

  const paint = () => {
    grid.innerHTML = ''
    images.forEach((src, i) => {
      const cell = document.createElement('div')
      cell.className = 'relative aspect-square'
      const img = document.createElement('img')
      img.src = src
      img.alt = ''
      img.className = 'w-full h-full object-cover rounded-xl bg-gray-100'
      const remove = document.createElement('button')
      remove.type = 'button'
      remove.className = 'absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs'
      remove.setAttribute('aria-label', 'Remover imagem')
      remove.textContent = '✕'
      remove.addEventListener('click', () => { images.splice(i, 1); paint() })
      cell.append(img, remove)
      grid.appendChild(cell)
    })
    if (images.length < MAX_IMAGES) {
      const add = document.createElement('button')
      add.type = 'button'
      add.className = 'aspect-square rounded-xl border-2 border-dashed border-gray-200 text-gray-400 flex flex-col items-center justify-center text-xs gap-1'
      add.innerHTML = '<span class="text-2xl leading-none">+</span><span>Adicionar</span>'
      add.addEventListener('click', () => input.click())
      grid.appendChild(add)
    }
  }

  input.addEventListener('change', async () => {
    const files = Array.from(input.files ?? []).slice(0, MAX_IMAGES - images.length)
    input.value = ''
    if (!files.length) return
    const overlay = LoadingOverlay()
    document.body.appendChild(overlay)
    try {
      for (const file of files) images.push(await institutionService.uploadFile(file))
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar a imagem', 'error')
    } finally {
      overlay.remove()
      paint()
    }
  })

  const hint = document.createElement('p')
  hint.className = 'text-xs text-gray-400'
  hint.textContent = 'JPG ou PNG, até 1 MB cada. Com mais de uma, aparecem em carrossel.'
  wrap.append(grid, hint, input)
  paint()
  return wrap
}

function group(text: string): HTMLDivElement {
  const wrap = document.createElement('div')
  wrap.className = 'flex flex-col gap-1'
  const l = document.createElement('span')
  l.className = label
  l.textContent = text
  wrap.appendChild(l)
  return wrap
}

function labelFor(id: string, text: string): HTMLLabelElement {
  const l = document.createElement('label')
  l.htmlFor = id
  l.className = label
  l.textContent = text
  return l
}

function inputField(id: string, text: string, inputType: string, value: string, placeholder = ''): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'flex flex-col gap-1'
  const input = document.createElement('input')
  input.id = id
  input.type = inputType
  input.value = value
  input.placeholder = placeholder
  input.className = field
  if (inputType === 'number') { input.min = '1'; input.step = '1'; input.inputMode = 'numeric' }
  wrap.append(labelFor(id, text), input)
  return wrap
}

function textField(id: string, text: string, value: string, maxLength: number): HTMLElement {
  const wrap = inputField(id, text, 'text', value)
  ;(wrap.querySelector('input') as HTMLInputElement).maxLength = maxLength
  return wrap
}

function textArea(id: string, text: string, value: string, placeholder = ''): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'flex flex-col gap-1'
  const area = document.createElement('textarea')
  area.id = id
  area.rows = 5
  area.maxLength = 5000
  area.value = value
  area.placeholder = placeholder
  area.className = `${field} resize-none`
  wrap.append(labelFor(id, text), area)
  return wrap
}

// ISO → valores dos campos date/time no fuso do aparelho
function splitLocal(iso?: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }
  const pad = (n: number) => String(n).padStart(2, '0')
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
}

export function unmount(): void {
  editingId = null
  type = 'common'
  images = []
}
