import { request } from './api';
export const institutionService = {
    async getById(id) {
        return request(`/institutions/${id}`);
    },
    async list(params) {
        const qs = new URLSearchParams(params).toString();
        return request(`/institutions${qs ? `?${qs}` : ''}`);
    },
    async search(query) {
        return request(`/institutions/search?q=${encodeURIComponent(query)}`);
    },
    async registerStep(payload) {
        return request('/institutions/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
    async uploadDocs(institutionId, files) {
        const token = localStorage.getItem('accessToken');
        await fetch(`${import.meta.env.VITE_API_URL}/institutions/${institutionId}/docs`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: files,
        });
    },
};
