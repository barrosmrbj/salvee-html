// Marcar o local da instituição no mapa (spec 17.6: "campanhas e instituições precisam ter localização válida").
// Três jeitos: GPS de quem está cadastrando (com permissão do navegador), buscar pelo endereço
// (Nominatim/OpenStreetMap, gratuito) ou tocar/arrastar o marcador. Mapa Leaflet + OpenStreetMap, sem chave;
// a biblioteca só é baixada quando o mapa aparece.
import { showToast } from './Toast'

export interface Coords {
  lat: number
  lng: number
}

export interface LocationPickerOptions {
  initial?: Coords | null
  /** endereço digitado no formulário, para o botão "Localizar pelo endereço" */
  getAddress: () => string
  onChange: (coords: Coords) => void
}

const BRAZIL: Coords = { lat: -14.2, lng: -51.9 }

export function LocationPicker(options: LocationPickerOptions): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'flex flex-col gap-2'

  const label = document.createElement('span')
  label.className = 'text-sm font-medium text-gray-700'
  label.textContent = 'Localização no mapa (recomendado)'
  const hint = document.createElement('span')
  hint.className = 'text-xs text-gray-400'
  hint.textContent = 'Usada em "Causas perto de você" e na rota até a instituição. Toque no mapa ou arraste o marcador para ajustar.'

  const buttons = document.createElement('div')
  buttons.className = 'grid grid-cols-2 gap-2'
  const btn = (text: string) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white active:scale-95 transition-transform disabled:opacity-50'
    b.textContent = text
    buttons.appendChild(b)
    return b
  }
  const gpsBtn = btn('📍 Usar minha localização')
  const addressBtn = btn('🔎 Localizar pelo endereço')

  const status = document.createElement('p')
  status.className = 'text-xs text-gray-500'
  const mapEl = document.createElement('div')
  mapEl.className = 'w-full h-56 rounded-xl bg-gray-100 overflow-hidden z-0'

  wrap.append(label, hint, buttons, mapEl, status)

  let current: Coords | null = options.initial ?? null
  let place: ((c: Coords, zoom?: number) => void) | null = null
  const showStatus = () => {
    status.textContent = current
      ? `Local marcado: ${current.lat.toFixed(5)}, ${current.lng.toFixed(5)}`
      : 'Nenhum local marcado ainda.'
  }
  showStatus()

  // Leaflet sob demanda; o mapa só mede o tamanho certo depois de estar na tela
  void (async () => {
    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')
    await new Promise(r => requestAnimationFrame(r))
    const map = L.map(mapEl, { zoomControl: true, attributionControl: true })
      .setView(current ?? BRAZIL, current ? 16 : 4)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)
    // ícone próprio: o padrão do Leaflet depende de imagens que o bundler não acha
    const icon = L.divIcon({
      className: '',
      html: '<div style="font-size:30px;line-height:30px;transform:translate(-50%,-100%)">📍</div>',
      iconSize: [0, 0],
    })
    let marker: import('leaflet').Marker | null = null
    place = (c: Coords, zoom?: number) => {
      current = { lat: c.lat, lng: c.lng }
      if (!marker) {
        marker = L.marker(current, { draggable: true, icon }).addTo(map)
        marker.on('dragend', () => {
          const p = marker!.getLatLng()
          current = { lat: p.lat, lng: p.lng }
          showStatus()
          options.onChange(current)
        })
      } else {
        marker.setLatLng(current)
      }
      map.setView(current, zoom ?? map.getZoom())
      showStatus()
      options.onChange(current)
    }
    if (current) place(current, 16)
    map.on('click', e => place?.({ lat: e.latlng.lat, lng: e.latlng.lng }))
    setTimeout(() => map.invalidateSize(), 200)
  })().catch(() => {
    mapEl.textContent = 'Não foi possível carregar o mapa.'
    mapEl.className = 'w-full rounded-xl bg-gray-50 text-xs text-gray-400 p-4'
  })

  // GPS de quem está cadastrando: o navegador pede permissão
  gpsBtn.addEventListener('click', () => {
    if (!('geolocation' in navigator)) { showToast('Este aparelho não oferece localização', 'error'); return }
    gpsBtn.disabled = true
    gpsBtn.textContent = 'Localizando…'
    navigator.geolocation.getCurrentPosition(
      pos => {
        gpsBtn.disabled = false
        gpsBtn.textContent = '📍 Usar minha localização'
        place?.({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 17)
        showToast('Local marcado. Confira no mapa e ajuste se precisar.', 'success')
      },
      err => {
        gpsBtn.disabled = false
        gpsBtn.textContent = '📍 Usar minha localização'
        showToast(err.code === err.PERMISSION_DENIED
          ? 'Permissão de localização negada. Use o endereço ou toque no mapa.'
          : 'Não foi possível obter a localização. Use o endereço ou toque no mapa.', 'error', 4000)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  })

  // endereço → coordenadas (Nominatim, OpenStreetMap)
  addressBtn.addEventListener('click', async () => {
    const address = options.getAddress().trim()
    if (!address) { showToast('Preencha o endereço e a cidade primeiro', 'error'); return }
    addressBtn.disabled = true
    addressBtn.textContent = 'Buscando…'
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(address)}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
      const list = await res.json() as Array<{ lat: string; lon: string }>
      if (!list.length) { showToast('Endereço não encontrado. Toque no mapa para marcar.', 'error', 4000); return }
      place?.({ lat: Number(list[0].lat), lng: Number(list[0].lon) }, 17)
      showToast('Local encontrado. Confira no mapa e ajuste se precisar.', 'success')
    } catch {
      showToast('Não foi possível buscar o endereço agora', 'error')
    } finally {
      addressBtn.disabled = false
      addressBtn.textContent = '🔎 Localizar pelo endereço'
    }
  })

  return wrap
}
