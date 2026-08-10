const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// CRITICAL: Serve vanilla frontend files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Import and mount routes
const booksRoutes = require('./routes/book');
app.use('/api/books', booksRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ statusCode: 500, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
