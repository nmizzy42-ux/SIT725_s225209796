const mongoose = require('mongoose');
const Book = require('../models/bookModel'); 

const MONGODB_URI = 'mongodb://127.0.0.1:27017/bookDB';

const seedBooks = [
    {
        id: "b1",
        title: "The Three-Body Problem",
        author: "Liu Cixin",
        year: 2008,
        genre: "Science Fiction",
        summary: "The Three-Body Problem is the first novel in the Remembrance of Earth's Past trilogy. The series portrays a fictional past, present, and future wherein Earth encounters an alien civilization from a nearby system of three Sun-like stars orbiting one another, a representative example of the three-body problem in orbital mechanics.",
        price: "29.99",
        currency: "AUD"
    },
    {
        id: "b2",
        title: "Jane Eyre",
        author: "Charlotte Brontë",
        year: 1847,
        genre: "Classic",
        summary: "An orphaned governess confronts class, morality, and love at Thornfield Hall, uncovering Mr. Rochester’s secret and forging her own independence.",
        price: "22.00",
        currency: "AUD"
    },
    {
        id: "b3",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        year: 1813,
        genre: "Classic",
        summary: "Elizabeth Bennet and Mr. Darcy navigate pride, misjudgement, and social expectations in a sharp study of manners and marriage.",
        price: "22.00",
        currency: "AUD"
    },
    {
        id: "b4",
        title: "The English Patient",
        author: "Michael Ondaatje",
        year: 1992,
        genre: "Historical Fiction",
        summary: "In a ruined Italian villa at the end of WWII, four strangers with intersecting pasts confront memory, identity, and loss.",
        price: "25.39",
        currency: "AUD"
    },
    {
        id: "b5",
        title: "Small Gods",
        author: "Terry Pratchett",
        year: 1992,
        genre: "Fantasy",
        summary: "In Omnia, the god Om returns as a tortoise, and novice Brutha must confront dogma, empire, and the nature of belief.",
        price: "31.99",
        currency: "AUD"
    }
];

async function runSeedingPipeline() {
    try {
        console.log('Connecting to MongoDB for seeding...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully.');

        //Verify the model constructor is compiled correctly
        if (typeof Book.deleteMany !== 'function') {
            throw new Error('Critical Initialization Error: The imported Book reference is not a compiled Mongoose Model function. Check your module.exports inside bookModel.js.');
        }

        //lean slate deployment guarantee
        console.log('Cleared existing books from the collection.');
        await Book.deleteMany({});

        //Batch execution of validated data sets
        await Book.insertMany(seedBooks);
        console.log(`Seeded ${seedBooks.length} books successfully.`);

    } catch (error) {
        console.error('Seeding failed:', error.message || error);
    } finally {
        //Disconnect resource connection handles cleanly
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
}

//Start processing line execution
runSeedingPipeline();