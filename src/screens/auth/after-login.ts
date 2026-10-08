// Para onde ir depois de entrar (spec 9.4): quem é responsável por instituição ainda não
// aprovada vê primeiro a tela de status dela; os demais vão para o feed.
import { institutionService } from '@/services'

export async function goAfterLogin(): Promise<void> {
  try {
    const mine = await institutionService.listMine()
    if (mine.some(i => i.status !== 'approved')) {
      window.location.replace('#/institution-status')
      return
    }
  } catch {
    // sem a lista, segue para o feed
  }
  window.location.replace('#/feed')
}
