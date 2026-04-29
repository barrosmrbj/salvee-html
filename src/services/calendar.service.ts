import { request } from './api'
import type { CalendarEvent } from '@/types'

export const calendarService = {
  async getMyEvents(): Promise<CalendarEvent[]> {
    return request<CalendarEvent[]>('/calendar/my-events')
  },

  async registerForEvent(eventId: string): Promise<void> {
    await request<void>(`/events/${eventId}/register`, { method: 'POST' })
  },

  async unregisterFromEvent(eventId: string): Promise<void> {
    await request<void>(`/events/${eventId}/unregister`, { method: 'DELETE' })
  },
}
