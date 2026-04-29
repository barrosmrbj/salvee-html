const BASE_URL = import.meta.env.VITE_API_URL ?? '';
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: status
        });
        this.name = 'ApiError';
    }
}
export async function request(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new ApiError(response.status, data.message ?? 'Erro desconhecido');
    }
    return data;
}
