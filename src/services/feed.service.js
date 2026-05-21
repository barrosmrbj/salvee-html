import { request } from './api';
export const feedService = {
    async listPosts(page = 1) {
        return request(`/feed?page=${page}`);
    },
    async getPostById(id) {
        return request(`/feed/${id}`);
    },
};
