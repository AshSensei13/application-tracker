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

app.listen(PORT, () => {
    console.log(`DevPath API is running at http://localhost:${PORT}`)
})