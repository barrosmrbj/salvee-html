import { request } from './api';
export const gamificationService = {
    async getBalance() {
        return request('/gamification/balance');
    },
    async listRewards() {
        return request('/gamification/rewards');
    },
    async redeemReward(rewardId) {
        return request(`/gamification/rewards/${rewardId}/redeem`, {
            method: 'POST',
        });
    },
};
