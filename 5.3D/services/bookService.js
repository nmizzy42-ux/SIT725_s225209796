const Book = require('../models/bookModel');

exports.getAllBooks = async () => {
    return await Book.find({});
};

exports.getBookById = async (id) => {
    return await Book.findOne({ id: id });
};
