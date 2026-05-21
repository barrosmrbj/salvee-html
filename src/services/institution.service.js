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
        return request('/institutions/register/step', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
    async uploadFile(file) {
        const token = localStorage.getItem('accessToken');
        const form = new FormData();
        form.append('file', file);
        const base = import.meta.env.VITE_API_URL ?? '';
        const res = await fetch(`${base}/upload`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Erro no upload');
        return data.url;
    },
};
