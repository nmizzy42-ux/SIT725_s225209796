// Import the Express module so we can create a web server.
const express = require('express');
// Import Node.js's built-in 'path' module to help with file paths.
const path = require('path');
// Create an instance of an Express application.
const app = express();
// Define the port number to listen on.
// It uses an environment variable PORT if provided; otherwise, it defaults to 3000.
const PORT = process.env.PORT || 3000;

// Set up middleware to serve static files from the "public" folder.
// This means that when a request is made to the root URL ("/"),
// Express will look for a file named index.html (or other static assets) inside the "public" directory.
app.use(express.static(path.join(__dirname, 'public')));

// Define a GET endpoint at '/square' that calculates the square of a number.
// GET endpoint at '/square' that returns JSON
app.get('/square', (req, res) => {
    const num = parseFloat(req.query.num);
    if (isNaN(num)) {
        return res.status(400).json({ error: "Please provide a valid number." });
    }
    const square = num * num;
    // Send a JSON object back instead of plain text
    res.json({ result: square });
});

// Create a GET endpoint at /add
// /add route to send JSON
app.get('/add', (req, res) => {
    const a = parseFloat(req.query.a);
    const b = parseFloat(req.query.b);

    if (isNaN(a) || isNaN(b)) {
        return res.status(400).json({ error: "Please provide valid numbers for both a and b." });
    }

    const sum = a + b;
    // Send a JSON object back
    res.json({ result: sum });
});

// Start the server and have it listen on the specified port.
// Once the server is running, log a message to the console indicating where it's accessible.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
