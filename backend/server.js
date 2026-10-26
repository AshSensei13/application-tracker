const express = require('express')

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

app.listen(PORT, () => {
    console.log(`DevPath API is running at http://localhost:${PORT}`)
})