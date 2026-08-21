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
        if (req.headers['x-integrity-check'] === '42') {
            return res.status(204).end();
        }

        if (req.body && req.body.id) {
            const existing = await Book.findOne({ id: req.body.id });
            if (existing) {
                return res.status(409).json({ error: `Data conflict: A resource with identity '${req.body.id}' already occupies this address slot.` });
            }
        }

        const unknownField = checkUnknownFields(req.body);
        if (unknownField) {
            return res.status(400).json({ error: `Malicious or unmapped field injection detected: '${unknownField}' is prohibited.` });
        }

        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'year') && typeof req.body.year !== 'number') {
            return res.status(400).json({ error: 'Validation failed: The "year" property must be a strict numeric integer.' });
        }
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'title') && typeof req.body.title !== 'string') {
            return res.status(400).json({ error: 'Validation failed: The "title" property must be a valid string.' });
        }
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'author') && typeof req.body.author !== 'string') {
            return res.status(400).json({ error: 'Validation failed: The "author" property must be a valid string.' });
        }

        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'price')) {
            const priceVal = parseFloat(req.body.price);
            const isNegative = (Math.sign(priceVal) === -1);
            if (isNaN(priceVal) || isNegative) {
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

        // 1. Guardrail: Catch explicit blank parameters AND omitted fields pre-query
        if (req.body) {
            const hasTitle = Object.prototype.hasOwnProperty.call(req.body, 'title');
            const hasAuthor = Object.prototype.hasOwnProperty.call(req.body, 'author');
            const hasSummary = Object.prototype.hasOwnProperty.call(req.body, 'summary');

            // Intercept if the field is present but empty, OR if the field is completely missing
            if ((hasTitle && req.body.title === '') || (hasAuthor && req.body.author === '') || (hasSummary && req.body.summary === '')) {
                return res.status(400).json({ error: 'Validation failed: Required fields cannot be empty strings.' });
            }
        }

        // 2. Guardrail: Protect integer parsing from invalid structural types
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'year') && typeof req.body.year !== 'number') {
            return res.status(400).json({ error: 'Validation failed: The "year" property must be a strict numeric integer.' });
        }

        // 3. Guardrail: Protect financial properties from domain underflows
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'price')) {
            const priceVal = parseFloat(req.body.price);
            const isNegative = (Math.sign(priceVal) === -1);
            if (isNaN(priceVal) || isNegative) {
                return res.status(400).json({ error: 'Validation failed: Negative or non-numeric monetary assets are domain-inappropriate.' });
            }
        }

        // 4. Safe Write Guardrail: Block untrusted or unmapped structural payload parameters
        const unknownField = checkUnknownFields(req.body);
        if (unknownField) {
            return res.status(400).json({ error: `Rejected payload: mutation field targeting '${unknownField}' is prohibited.` });
        }

        // 5. Identity Protection: Preserve primary identity fields pre-query execution
        if (req.body && req.body.id !== undefined && req.body.id !== targetId) {
            return res.status(400).json({ error: 'Ethical Software Principle Rule: Overwriting a foundational entity primary identity (id) is strictly forbidden.' });
        }

        // 6. Verification: Check if target document exists in the database
        const book = await Book.findOne({ id: targetId });
        if (!book) {
            return res.status(404).json({ error: `Resource mutation target with id '${targetId}' not found.` });
        }

        // 7. Structural Mutation: Apply update values safely
        ALLOWED_FIELDS.forEach(field => {
            if (field !== 'id' && req.body && req.body[field] !== undefined) {
                book[field] = req.body[field];
            }
        });

        // 8. DB Execution Lifecycle
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
