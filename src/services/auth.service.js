import { request } from './api';
export const authService = {
    async login(payload) {
        const tokens = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        return tokens;
    },
    async register(payload) {
        const tokens = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        return tokens;
    },
    async forgotPassword(email) {
        await request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },
    async verifyPhone(phone, code) {
        await request('/auth/verify-phone', {
            method: 'POST',
            body: JSON.stringify({ phone, code }),
        });
    },
    async sendPhoneCode(phone) {
        await request('/auth/send-phone-code', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        });
    },
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    },
    async getMe() {
        return request('/auth/me');
    },
};
