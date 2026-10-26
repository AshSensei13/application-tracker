const express = require('express')
const pool = require('./db')

const app = express()
const PORT = 3000

// Allow express to parse incoming JSON request bodies.
app.use(express.json())

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "DevPath API is running",
    })
})

// Get all companies
app.get('/api/companies', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                company_id,
                company_name,
                company_website,
                created_at
            FROM companies
            ORDER BY company_name ASC
        `);

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error fetching companies:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch companies',
        });
    }
});

// Get all job applications
app.get('/api/applications', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                ja.application_id,
                c.company_name,
                c.company_website,
                ja.job_title,
                ja.job_description,
                ja.job_url,
                ja.application_status,
                ja.date_applied,
                ja.created_at,
                ja.updated_at
            FROM job_applications AS ja
            JOIN companies AS c
                ON ja.company_id = c.company_id
            ORDER BY ja.created_at DESC
        `);

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error fetching applications:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
        });
    }
});


 // Create a new job application
app.post('/api/applications', async (req, res) => {
    const {
        company_id,
        job_title,
        job_description,
        job_url,
        application_status,
        date_applied,
    } = req.body;

    // Validate required fields
    if (!company_id || !job_title) {
        return res.status(400).json({
            success: false,
            message: 'Company ID and job title are required',
        });
    }

    try {
        const result = await pool.query(
            `
                INSERT INTO job_applications (
                    company_id,
                    job_title,
                    job_description,
                    job_url,
                    application_status,
                    date_applied
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `,
            [
                company_id,
                job_title,
                job_description || null,
                job_url || null,
                application_status || 'saved',
                date_applied || null,
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Job application created successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error creating application:', error.message);

        // Error code: Foreign key violation
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'The specified company does not exist',
            });
        }
        // Error code: Check constraint violation
        if (error.code === '23514') {
            return res.status(400).json({
                success: false,
                message: 'Invalid application status',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create job application',
        });
    }
});


app.listen(PORT, () => {
    console.log(`DevPath API is running at http://localhost:${PORT}`)
})