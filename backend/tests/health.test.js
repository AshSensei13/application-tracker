const request = require('supertest');
const app = require('../server');

describe('GET /api/health', () => {
    test('returns a successful health check response', async () => {
        const response = await request(app)
            .get('/api/health');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            message: 'DevPath API is running',
        });
    });
});