const request = require('supertest');
const { expect } = require('chai');
const express = require('express');

//Import the specific layers we want to test
const booksRoutes = require('../routes/book');
const bookService = require('../services/bookService');

describe('Book API System Tests', () => {
    let app;
    let originalGetAllBooks;
    let originalGetBookById;

    //Set up an isolated, clean test Express app before running tests
    before(() => {
        app = express();
        app.use(express.json());
        app.use('/api/books', booksRoutes);

        //Global error handler mapping to match your server.js logic
        app.use((err, req, res, next) => {
            res.status(500).json({ statusCode: 500, message: 'Internal Server Error' });
        });

        //Backup original service methods so we can restore them later
        originalGetAllBooks = bookService.getAllBooks;
        originalGetBookById = bookService.getBookById;
    });

    //Clean up stubs after every individual test case
    afterEach(() => {
        bookService.getAllBooks = originalGetAllBooks;
        bookService.getBookById = originalGetBookById;
    });

    describe('GET /api/books (Retrieve Catalog)', () => {
        it('should return 200 OK and a list of all cataloged books', async () => {
            const mockCatalog = [
                { id: "b1", title: "The Three-Body Problem", author: "Liu Cixin", price: "29.99" },
                { id: "b2", title: "Jane Eyre", author: "Charlotte Brontë", price: "22.00" }
            ];

            //Stub out service layer to return mock data instantly
            bookService.getAllBooks = async () => mockCatalog;

            const res = await request(app)
                .get('/api/books')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).to.be.an('object');
            expect(res.body.statusCode).to.equal(200);
            expect(res.body.message).to.equal('Book catalog retrieved successfully.');
            expect(res.body.data).to.be.an('array').with.lengthOf(2);
            expect(res.body.data[0].id).to.equal('b1');
        });

        it('should forward server exceptions to the global error handler', async () => {
            //Force service layer to break and throw an operational error
            bookService.getAllBooks = async () => { throw new Error('Database connection failed'); };

            const res = await request(app)
                .get('/api/books')
                .expect(500);

            expect(res.body.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Internal Server Error');
        });
    });

    describe('GET /api/books/:id (Retrieve Individual Book)', () => {
        it('should return 200 OK with the target book payload if valid ID matches', async () => {
            const mockBook = { id: "b3", title: "Pride and Prejudice", author: "Jane Austen" };
            bookService.getBookById = async (id) => id === 'b3' ? mockBook : null;

            const res = await request(app)
                .get('/api/books/b3')
                .expect(200);

            expect(res.body.statusCode).to.equal(200);
            expect(res.body.data).to.be.an('object');
            expect(res.body.data.title).to.equal('Pride and Prejudice');
        });

        it('should return 404 Not Found if the requested book ID does not exist', async () => {
            bookService.getBookById = async () => null; 

            const res = await request(app)
                .get('/api/books/missing_id')
                .expect(404);

            expect(res.body.statusCode).to.equal(404);
            expect(res.body.message).to.equal('Book not found');
        });
    });
});
