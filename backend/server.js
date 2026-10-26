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

app.listen(PORT, () => {
    console.log(`DevPath API is running at http://localhost:${PORT}`)
})