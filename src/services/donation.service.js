import { request } from './api';
export const donationService = {
    async initiate(payload) {
        return request('/donations/initiate', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
    async confirm(donationId) {
        return request(`/donations/${donationId}/confirm`, {
            method: 'POST',
        });
    },
    async getHistory() {
        return request('/donations/history');
    },
};
