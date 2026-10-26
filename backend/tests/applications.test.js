const request = require('supertest');

jest.mock('../db', () => ({
    query: jest.fn(),
}));

const pool = require('../db');
const app = require('../server');

describe('Applications API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns a list of job applications successfully', async () => {
        pool.query.mockResolvedValue({
            rows: [
                {
                    application_id: 1,
                    company_name: 'Microsoft',
                    company_website: 'https://www.microsoft.com',
                    job_title: 'Software Engineer',
                    job_description: 'Develop software applications',
                    job_url: 'https://example.com/jobs/1',
                    application_status: 'applied',
                    date_applied: '2026-10-20',
                    created_at: '2026-10-20T10:00:00.000Z',
                    updated_at: '2026-10-20T10:00:00.000Z',
                },
            ],
        });

        const response = await request(app)
            .get('/api/applications');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: [
                {
                    application_id: 1,
                    company_name: 'Microsoft',
                    company_website: 'https://www.microsoft.com',
                    job_title: 'Software Engineer',
                    job_description: 'Develop software applications',
                    job_url: 'https://example.com/jobs/1',
                    application_status: 'applied',
                    date_applied: '2026-10-20',
                    created_at: '2026-10-20T10:00:00.000Z',
                    updated_at: '2026-10-20T10:00:00.000Z',
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
                .get('/api/applications');

            expect(response.statusCode).toBe(500);

            expect(response.body).toEqual({
                success: false,
                message: 'Failed to fetch applications',
            });

            expect(pool.query).toHaveBeenCalledTimes(1);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching applications:',
                'Database connection failed'
            );
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    describe('POST /api/applications', () => {
        test('creates a job application successfully', async () => {
            const newApplication = {
                application_id: 5,
                company_id: 1,
                job_title: 'Software Engineer',
                job_description: 'Develop software applications',
                job_url: 'https://example.com/jobs/5',
                application_status: 'applied',
                date_applied: '2026-10-26',
            };

            pool.query.mockResolvedValue({
                rows: [newApplication],
            });

            const response = await request(app)
                .post('/api/applications')
                .send({
                    company_id: 1,
                    job_title: 'Software Engineer',
                    job_description: 'Develop software applications',
                    job_url: 'https://example.com/jobs/5',
                    application_status: 'applied',
                    date_applied: '2026-10-26',
                });

            expect(response.statusCode).toBe(201);

            expect(response.body).toEqual({
                success: true,
                message: 'Job application created successfully',
                data: newApplication,
            });

            expect(pool.query).toHaveBeenCalledTimes(1);

            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO job_applications'),
                [
                    1,
                    'Software Engineer',
                    'Develop software applications',
                    'https://example.com/jobs/5',
                    'applied',
                    '2026-10-26',
                ]
            );
        });

        test('returns 400 when company ID is missing', async () => {
            const response = await request(app)
                .post('/api/applications')
                .send({
                    job_title: 'Software Engineer',
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                success: false,
                message: 'Company ID and job title are required',
            });

            expect(pool.query).not.toHaveBeenCalled();
        });

        test('returns 400 when job title is missing', async () => {
            const response = await request(app)
                .post('/api/applications')
                .send({
                    company_id: 1,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                success: false,
                message: 'Company ID and job title are required',
            });

            expect(pool.query).not.toHaveBeenCalled();
        });
        
        test('returns 400 when the company does not exist', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            try {
                const error = new Error('Foreign key violation')
                error.code = '23503'
                pool.query.mockRejectedValue(error)
                
                const response = await request(app)
                .post('/api/applications')
                .send({
                    company_id: 9999,
                    job_title: 'Software Engineer',
                });

                expect(response.statusCode).toBe(400);

                expect(response.body).toEqual({
                    success: false,
                    message: 'The specified company does not exist',
                });

                expect(pool.query).toHaveBeenCalledTimes(1);

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Error creating application:',
                    'Foreign key violation'
                )
            } finally {
                consoleErrorSpy.mockRestore()
            }
        });

        test('returns 400 when the application status is invalid', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            try {
                const error = new Error('Check constraint violation')
                error.code = '23514'
                pool.query.mockRejectedValue(error)

                const response = await request(app)
                    .post('/api/applications')
                    .send({
                        company_id: 1,
                        job_title: 'Software Engineer',
                        application_status: 'pending',
                    });

                expect(response.statusCode).toBe(400);

                expect(response.body).toEqual({
                    success: false,
                    message: 'Invalid application status',
                });

                expect(pool.query).toHaveBeenCalledTimes(1);

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Error creating application:',
                    'Check constraint violation'
                )
            } finally {
                consoleErrorSpy.mockRestore()
            }
        });

        test('uses default values when optional fields are omitted', async () => {
            const newApplication = {
                application_id: 6,
                company_id: 1,
                job_title: 'Software Engineer',
                job_description: null,
                job_url: null,
                application_status: 'saved',
                date_applied: null,
            };

            pool.query.mockResolvedValue({
                rows: [newApplication],
            });

            const response = await request(app)
                .post('/api/applications')
                .send({
                    company_id: 1,
                    job_title: 'Software Engineer',
                });

            expect(response.statusCode).toBe(201);

            expect(response.body).toEqual({
                success: true,
                message: 'Job application created successfully',
                data: newApplication,
            });

            expect(pool.query).toHaveBeenCalledTimes(1);

            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO job_applications'),
                [
                    1,
                    'Software Engineer',
                    null,
                    null,
                    'saved',
                    null,
                ]
            );
        });

        test('returns a 500 error when an unexpected database error occurs', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            try {
                pool.query.mockRejectedValue(
                    new Error('Unexpected database error')
                );

                const response = await request(app)
                    .post('/api/applications')
                    .send({
                        company_id: 1,
                        job_title: 'Software Engineer',
                    });

                expect(response.statusCode).toBe(500);

                expect(response.body).toEqual({
                    success: false,
                    message: 'Failed to create job application',
                });

                expect(pool.query).toHaveBeenCalledTimes(1);

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Error creating application:',
                    'Unexpected database error'
                );
            } finally {
                consoleErrorSpy.mockRestore();
            }
        });

        
    });
});
