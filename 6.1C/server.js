const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const PORT = 3004;

//MongoDB URI direct injection
mongoose.connect('mongodb://127.0.0.1:27017/bookDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB initial connection error:', err));

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//Routes Layer Mount
const booksRoutes = require('./routes/book');
app.use('/api/books', booksRoutes);

//Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ statusCode: 500, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
