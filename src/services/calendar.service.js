import { request } from './api';
export const calendarService = {
    async getMyEvents() {
        return request('/calendar/my-events');
    },
    async registerForEvent(eventId) {
        await request(`/events/${eventId}/register`, { method: 'POST' });
    },
    async unregisterFromEvent(eventId) {
        await request(`/events/${eventId}/unregister`, { method: 'DELETE' });
    },
};
