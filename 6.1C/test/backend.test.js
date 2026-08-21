const request = require('supertest');
const { expect } = require('chai');
const express = require('express');

//Import the targets required
const booksRoutes = require('../routes/book');
const bookService = require('../services/bookService');
const { calculateOrderTotal } = require('../src/utils');

describe('Workshop Target Deliverables - Combined Backend Suite', () => {
    let app;
    let originalGetBookById;

    before(() => {
        app = express();
        app.use(express.json());
        app.use('/api/books', booksRoutes);

        //Match project global error behavior
        app.use((err, req, res, next) => {
            res.status(500).json({ statusCode: 500, message: 'Internal Server Error' });
        });

        originalGetBookById = bookService.getBookById;
    });

    afterEach(() => {
        bookService.getBookById = originalGetBookById;
    });

    // Feature 1: Feature rest API endpoint tests
    describe('Feature A: REST API Endpoint (GET /api/books/:id)', () => {

        //Test Case 1: Valid Behaviour
        it(' should return 200 and data payload when a matching book ID is found', async () => {
            const mockPayload = { id: "b2", title: "Jane Eyre", author: "Charlotte Brontë" };
            bookService.getBookById = async (id) => id === 'b2' ? mockPayload : null;

            const res = await request(app)
                .get('/api/books/b2')
                .expect(200);

            expect(res.body.statusCode).to.equal(200);
            expect(res.body.data.title).to.equal('Jane Eyre');
        });

        //Test Case 2: Invalid/Error Behaviour
        it(' should return 404 when requested book ID does not match any catalog entry', async () => {
            bookService.getBookById = async () => null;

            const res = await request(app)
                .get('/api/books/unknown_id')
                .expect(404);

            expect(res.body.statusCode).to.equal(404);
            expect(res.body.message).to.equal('Book not found');
        });
    });

    //Feature 2: Calculation function tests
    describe('Feature B: Calculation Function (calculateOrderTotal)', () => {

        //Test Case 3: Edge Case (Boundary condition for bulk discount processing)
        it(' should successfully apply a 10% volume discount only when 3 or more book prices are processed', () => {
            // Edge constraint exact threshold: 3 items ($10 + $20 + $30 = $60)
            // $60 subtotal - 10% discount ($6) = $54 -> $54 + 10% GST ($5.4) = $59.40 final
            const resultWithDiscount = calculateOrderTotal([10, 20, 30]);
            expect(resultWithDiscount).to.equal(59.40);

            //Control check: 2 items ($10 + $20 = $30) -> No discount applied -> $30 + 10% GST = $33.00 final
            const resultNoDiscount = calculateOrderTotal([10, 20]);
            expect(resultNoDiscount).to.equal(33.00);
        });

        //Test Case 4: Invalid/Error Behaviour
        it(' should immediately throw a TypeError if input argument is not an array pattern', () => {
            expect(() => calculateOrderTotal("29.99")).to.throw(TypeError, 'Input must be an array of prices');
            expect(() => calculateOrderTotal(125)).to.throw(TypeError);
        });

        //Bonus Test Case 5: Edge Case (Handling mixed datatype string representations of numbers securely)
        it(' should accurately parse valid numeric price string types passed from Decimal128 schemas', () => {
            //Mongoose Decimal128 schema getters pass down text strings like "25.39"
            const result = calculateOrderTotal(["25.39", "22.00"]);
            //($25.39 + $22.00) * 1.10 = $52.129 -> rounded cleanly to 52.13
            expect(result).to.equal(52.13);
        });
    });
});
