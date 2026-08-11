const bookService = require('../services/bookService');

exports.getAllBooks = async (req, res, next) => {
    try {
        const items = await bookService.getAllBooks();
        res.status(200).json({
            statusCode: 200,
            data: items,
            message: 'Book catalog retrieved successfully.'
        });
    } catch (err) {
        next(err);
    }
};

exports.getBookById = async (req, res, next) => {
    try {
        const book = await bookService.getBookById(req.params.id);
        if (!book) {
            return res.status(404).json({ statusCode: 404, message: 'Book not found' });
        }
        res.status(200).json({ statusCode: 200, data: book });
    } catch (err) {
        next(err);
    }
};
