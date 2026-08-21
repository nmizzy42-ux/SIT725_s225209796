const { expect } = require('chai');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

//Read exact index.html template file
const htmlSource = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');

describe('Front-End UI Systems - index.html', () => {
    let dom;
    let window;
    let document;
    let fetchCalls;

    beforeEach(() => {
        fetchCalls = [];

        //Spin up a clean, sandboxed DOM window context for each separate test case
        dom = new JSDOM(htmlSource, { runScripts: "dangerously" });
        window = dom.window;
        document = window.document;

        //Stub out the browser window's fetch layer to mock server API responses safely
        window.fetch = async (url) => {
            fetchCalls.push(url);

            if (url === '/api/books') {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        statusCode: 200,
                        data: [
                            { id: "b1", title: "The Three-Body Problem", price: "29.99", currency: "AUD" },
                            { id: "b2", title: "Jane Eyre", price: "22.00", currency: "AUD" }
                        ]
                    })
                };
            }

            if (url === '/api/books/b1') {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        statusCode: 200,
                        data: {
                            id: "b1",
                            title: "The Three-Body Problem",
                            author: "Liu Cixin",
                            year: 2008,
                            genre: "Science Fiction",
                            summary: "An alien civilization encounter.",
                            price: "29.99"
                        }
                    })
                };
            }

            return { ok: false, status: 404 };
        };
    });

    it('should present the developer branding title directly on load', () => {
        const header = document.querySelector('h1');
        expect(header.textContent).to.equal('Books Catalogue developed by s225209796');
    });

    it('should request and list catalog records cleanly when clicking "Get all Books"', async () => {
        const getAllBtn = document.getElementById('getAllBtn');
        const listDisplay = document.getElementById('listDisplay');

        //Fire a live virtual click trigger on the button
        getAllBtn.click();

        //Allow microtasks queue loop to process async fetch resolution
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(fetchCalls).to.include('/api/books');

        const renderedItems = listDisplay.querySelectorAll('.book-item');
        expect(renderedItems).to.have.lengthOf(2);
        expect(renderedItems[0].textContent).to.equal('The Three-Body Problem 29.99 AUD');
    });

    it('should pull single item profiles when clicking a rendered catalog item block', async () => {
        const getAllBtn = document.getElementById('getAllBtn');
        const listDisplay = document.getElementById('listDisplay');
        const detailsDisplay = document.getElementById('detailsDisplay');

        getAllBtn.click();
        await new Promise(resolve => setTimeout(resolve, 10));

        //Click the very first book node in the generated list
        const singleBookElement = listDisplay.querySelector('.book-item');
        singleBookElement.click();

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(fetchCalls).to.include('/api/books/b1');

        const summaryText = detailsDisplay.querySelector('.details-container');
        expect(summaryText.innerHTML).to.include('<strong>Author:</strong> Liu Cixin');
        expect(summaryText.innerHTML).to.include('An alien civilization encounter.');
    });
});
