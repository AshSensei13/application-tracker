const request = require('supertest');

jest.mock('../db', () => ({
    query: jest.fn(),
}));

const pool = require('../db');
const app = require('../server');

describe('GET /api/companies', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns a list of companies successfully', async () => {
        pool.query.mockResolvedValue({
            rows: [
                {
                    company_id: 1,
                    company_name: 'BBC',
                    company_website: 'https://www.bbc.co.uk',
                    created_at: '2026-10-26T09:00:00.000Z',
                },
                {
                    company_id: 2,
                    company_name: 'Microsoft',
                    company_website: 'https://www.microsoft.com',
                    created_at: '2026-10-26T10:00:00.000Z',
                },
            ],
        });

        const response = await request(app)
            .get('/api/companies');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: [
                {
                    company_id: 1,
                    company_name: 'BBC',
                    company_website: 'https://www.bbc.co.uk',
                    created_at: '2026-10-26T09:00:00.000Z',
                },
                {
                    company_id: 2,
                    company_name: 'Microsoft',
                    company_website: 'https://www.microsoft.com',
                    created_at: '2026-10-26T10:00:00.000Z',
                },
            ],
        });

        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('returns a 500 error when the database query fails', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        try {
            pool.query.mockRejectedValue(
                new Error('Database connection failed')
            );

            const response = await request(app)
                .get('/api/companies');

            expect(response.statusCode).toBe(500);

            expect(response.body).toEqual({
                success: false,
                message: 'Failed to fetch companies',
            });

            expect(pool.query).toHaveBeenCalledTimes(1);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching companies:',
                'Database connection failed'
            );
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

});
