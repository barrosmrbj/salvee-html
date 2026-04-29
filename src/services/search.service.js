import { request } from './api';
export const searchService = {
    async search(query) {
        return request(`/search?q=${encodeURIComponent(query)}`);
    },
    async listCategories() {
        return request('/categories');
    },
    async getNearby(lat, lng) {
        return request(`/institutions/nearby?lat=${lat}&lng=${lng}`);
    },
};
