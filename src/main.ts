import '@/styles/global.css'
import { Router } from '@/router'

const app = document.getElementById('app')
if (!app) throw new Error('#app element not found')

const router = new Router()

if (!window.location.hash || window.location.hash === '#') {
  window.location.hash = '/'
} else {
  void router.resolve()
}
