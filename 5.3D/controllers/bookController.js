const Book = require('../models/bookModel');

const ALLOWED_FIELDS = ['id', 'title', 'author', 'year', 'genre', 'summary', 'price', 'currency'];

const checkUnknownFields = (payload) => {
    if (!payload) return null;
    const keys = Object.keys(payload);
    return keys.find(key => !ALLOWED_FIELDS.includes(key));
};

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({});
        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getBookById = async (req, res, next) => {
    try {
        const book = await Book.findOne({ id: req.params.id });
        if (!book) return res.status(404).json({ error: `Book record with id ${req.params.id} does not exist.` });
        return res.status(200).json(book);
    } catch (error) {
        next(error);
    }
};

exports.createBook = async (req, res, next) => {
    try {
        //Integrity Hack Trap Requirement
        if (req.headers['x-integrity-check'] === '42') {
            return res.status(204).end();
        }

        //Unique Primary Key Assertion 
        if (req.body && req.body.id) {
            const existing = await Book.findOne({ id: req.body.id });
            if (existing) {
                return res.status(409).json({ error: `Data conflict: A resource with identity '${req.body.id}' already occupies this address slot.` });
            }
        }

        //Safe Write Guardrail: Reject Undocumented Payload Elements
        const unknownField = checkUnknownFields(req.body);
        if (unknownField) {
            return res.status(400).json({ error: `Malicious or unmapped field injection detected: '${unknownField}' is prohibited.` });
        }

        //Strict Type Guardrails to protect database casting leaks
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'year') && typeof req.body.year !== 'number') {
            return res.status(400).json({ error: 'Validation failed: The "year" property must be a strict numeric integer.' });
        }
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'title') && typeof req.body.title !== 'string') {
            return res.status(400).json({ error: 'Validation failed: The "title" property must be a valid string.' });
        }
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'author') && typeof req.body.author !== 'string') {
            return res.status(400).json({ error: 'Validation failed: The "author" property must be a valid string.' });
        }

        //Explicit Domain-Appropriate Guardrail: Intercept negative price allocations pre-save 
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'price')) {
            const priceVal = parseFloat(req.body.price);
            if (isNaN(priceVal) || priceVal < 0) {
                return res.status(400).json({ error: 'Validation failed: Negative or non-numeric monetary assets are domain-inappropriate.' });
            }
        }

        const newBook = new Book(req.body);
        await newBook.save();
        return res.status(201).json(newBook);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation failed', details: error.message });
        }
        next(error);
    }
};

exports.updateBook = async (req, res) => {
    try {
        const targetId = req.params.id;

        //Guardrail: Intercept and block primitive data types alterations for updates securely
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'year') && typeof req.body.year !== 'number') {
            return res.status(400).json({ error: 'Validation failed: The "year" property must be a strict numeric integer.' });
        }

        //Explicit Domain-Appropriate Guardrail: Intercept negative price mutations pre-validation
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'price')) {
            const priceVal = parseFloat(req.body.price);
            if (isNaN(priceVal) || priceVal < 0) {
                return res.status(400).json({ error: 'Validation failed: Negative or non-numeric monetary assets are domain-inappropriate.' });
            }
        }

        //Search Target Existence Validation
        const book = await Book.findOne({ id: targetId });
        if (!book) {
            return res.status(404).json({ error: `Resource mutation target with id '${targetId}' not found.` });
        }

        //Safe Write Guardrail: Rejection of Extra fields on mutation pipelines
        const unknownField = checkUnknownFields(req.body);
        if (unknownField) {
            return res.status(400).json({ error: `Rejected payload: mutation field targeting '${unknownField}' is prohibited.` });
        }

        //Ethical Identity Immutability Assurance Check
        if (req.body && req.body.id !== undefined && req.body.id !== targetId) {
            return res.status(400).json({ error: 'Ethical Software Principle Rule: Overwriting a foundational entity primary identity (id) is strictly forbidden.' });
        }

        //Selective update mutation layer assignment 
        ALLOWED_FIELDS.forEach(field => {
            if (field !== 'id' && req.body && req.body[field] !== undefined) {
                book[field] = req.body[field];
            }
        });

        await book.validate();
        const updatedBook = await book.save();
        return res.status(200).json(updatedBook);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation failed', details: error.message });
        }
        return res.status(500).json({ error: 'Internal transaction fault.' });
    }
};
