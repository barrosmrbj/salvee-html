import { request } from './api';
export const userService = {
    async getProfile() {
        return request('/users/me');
    },
    async updateProfile(data) {
        return request('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
    async uploadAvatar(file) {
        const form = new FormData();
        form.append('avatar', file);
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/avatar`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
        });
        return res.json();
    },
};
