const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'Primary entity identity string (id) is required.'],
        unique: true,
        trim: true,
        match: [/^[a-zA-Z0-9_-]+$/, 'Identity contains illegal characters. Only alphanumeric characters, dashes, and underscores are allowed.']
    },
    title: {
        type: String,
        required: [true, 'Book title is required.'],
        minlength: [2, 'Title length violation: must contain at least 2 characters.'],
        maxlength: [150, 'Title length violation: cannot exceed 150 characters.'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author name tracking field is required.'],
        minlength: [2, 'Author name violation: must contain at least 2 characters.'],
        maxlength: [100, 'Author name violation: cannot exceed 100 characters.'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Publication calendar year is required.'],
        min: [868, 'Temporal validation violation: Year underflow. The oldest printed book dates back to 868 AD.'],
        max: [2026, 'Temporal validation violation: Year ceiling breach. Future allocation indexes are prohibited.']
    },
    genre: {
        type: String,
        required: [true, 'Classification genre property is required.'],
        enum: {
            values: ['Fiction', 'Non-Fiction', 'Classic', 'Science Fiction', 'Fantasy', 'Biography', 'Historical Fiction', 'Mystery'],
            message: 'Schema taxonomy rejection: `{VALUE}` is not a registered compliance classification enum.'
        }
    },
    summary: {
        type: String,
        required: [true, 'Description summary block is required.'],
        minlength: [10, 'Summary data density underflow: description must contain at least 10 characters.'],
        maxlength: [1000, 'Summary data density overflow: description cannot exceed 1000 characters.'],
        trim: true
    },
    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, 'Denomination transaction price is required.'],
        min: [0.00, 'Boundary testing failure: Negative monetary values are domain-inappropriate. Price must be 0.00 or higher.']
    },
    currency: {
        type: String,
        required: [true, 'Accounting currency denomination rule is required.'],
        // Removed: hardcoded default property to allow the required validator to intercept blank requests
        enum: {
            values: ['AUD'],
            message: 'Geographical currency standard mismatch: `{VALUE}` rejected. Only AUD transactions are accepted.'
        }
    }
});

// Pre-save database driver interceptor to safely apply fallbacks only when valid
BookSchema.pre('save', function (next) {
    if (!this.currency) {
        this.currency = 'AUD';
    }
    next();
});

const Book = mongoose.model('Book', BookSchema);
module.exports = Book;
