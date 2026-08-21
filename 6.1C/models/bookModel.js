const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    summary: { type: String, required: true },
    price: { type: mongoose.Schema.Types.Decimal128, required: true, get: v => v ? v.toString() : null },
    currency: { type: String, required: true, default: 'AUD' }
}, {
    toJSON: { getters: true, virtuals: false, transform(_doc, ret) { delete ret.__v; delete ret._id; return ret; } },
    toObject: { getters: true, virtuals: false }
});

module.exports = mongoose.model('Book', BookSchema);
