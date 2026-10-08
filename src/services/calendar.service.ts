import { request } from './api'
import type { CalendarEvent } from '@/types'

export const calendarService = {
  async getMyEvents(): Promise<CalendarEvent[]> {
    return request<CalendarEvent[]>('/calendar/my-events')
  },

  /** "Participar" de um evento (o id é o do post do tipo evento) */
  async registerForEvent(eventId: string): Promise<void> {
    await request<void>(`/calendar/events/${eventId}/register`, { method: 'POST' })
  },

  async unregisterFromEvent(eventId: string): Promise<void> {
    await request<void>(`/calendar/events/${eventId}/register`, { method: 'DELETE' })
  },
}
