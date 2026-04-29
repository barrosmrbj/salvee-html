import { describe, it, expect, vi, beforeEach } from 'vitest';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);
describe('request', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.resetModules();
    });
    it('calls correct URL with JSON headers', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: '1' }),
        });
        const { request } = await import('@/services/api');
        const result = await request('/users/1');
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/users/1'), expect.objectContaining({
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        }));
        expect(result).toEqual({ id: '1' });
    });
    it('injects Authorization header when token exists', async () => {
        localStorage.setItem('accessToken', 'my-token');
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        const { request } = await import('@/services/api');
        await request('/protected');
        expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
        }));
    });
    it('throws ApiError when response is not ok', async () => {
        const errorResponse = {
            ok: false,
            status: 401,
            json: async () => ({ message: 'Unauthorized' }),
        };
        mockFetch.mockResolvedValueOnce(errorResponse);
        mockFetch.mockResolvedValueOnce(errorResponse);
        const { request, ApiError } = await import('@/services/api');
        await expect(request('/protected')).rejects.toThrow('Unauthorized');
        await expect(request('/protected').catch(e => e)).resolves.toBeInstanceOf(ApiError);
    });
});
