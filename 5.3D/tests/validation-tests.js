const SERVER_URL = "http://localhost:3004/api/books";

const VALID_SEEDED_ID = "b1";

const coverageTracker = {
    CREATE_FAIL: 0,
    UPDATE_FAIL: 0,
    TYPE: 0,
    REQUIRED: 0,
    BOUNDARY: 0,
    LENGTH: 0,
    TEMPORAL: 0,
    UNKNOWN_CREATE: 0,
    UNKNOWN_UPDATE: 0,
    IMMUTABLE: 0
};

let globalTestFailed = false;

function makeValidBook(id) {
    return {
        id,
        title: "Valid Core Title",
        author: "Valid Core Author",
        year: 2024,
        genre: "Science Fiction",
        summary: "This is a completely valid structural descriptive summary of the book.",
        price: "29.99",
        currency: "AUD"
    };
}

async function test(id, name, method, endpoint, expectedStatus, tag, fn) {
    let actualStatus = null;
    let pass = 'N';

    try {
        const res = await fn();
        actualStatus = res ? res.status : "NO_RESPONSE";

        if (actualStatus === expectedStatus) {
            pass = 'Y';
        } else {
            coverageTracker[tag]++;
            globalTestFailed = true;
        }
    } catch (e) {
        actualStatus = "ERROR";
        coverageTracker[tag]++;
        globalTestFailed = true;
    } finally {
        console.log(`TEST|${id}|${name}|${method}|${endpoint}|expected=${expectedStatus}|actual=${actualStatus}|pass=${pass}`);
    }
}

async function runAllTests() {
    console.log(`Executing Ethical Validation Mapping Framework Assertions against http://localhost:3004...`);

    //CAT1: Required Field Validation
    await test('T01', 'Missing Title', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('t01'); delete book.title;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T06', 'Missing Author field tracking', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('t06'); delete book.author;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T07', 'Missing Description Summary block', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('t07'); delete book.summary;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    //CAT2: Type Validation
    await test('T05', 'Year as String Primitive', 'POST', '/api/books', 400, 'TYPE', async () => {
        const book = makeValidBook('t05'); book.year = "2024";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T08', 'Title data field type mismatch', 'POST', '/api/books', 400, 'TYPE', async () => {
        const book = makeValidBook('t08'); book.title = 12345;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T09', 'Author parameter object injection type verification', 'POST', '/api/books', 400, 'TYPE', async () => {
        const book = makeValidBook('t09'); book.author = { name: "Terry Pratchett" };
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T18', 'Update pipeline type coercion rejection criteria', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'TYPE', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year: "1995" }) });
    });

    //CAT3: Boundary Testing
    await test('T02', 'Year too low', 'POST', '/api/books', 400, 'BOUNDARY', async () => {
        const book = makeValidBook('t02'); book.year = 800;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T14', 'Invalid price structural layout assignment', 'POST', '/api/books', 400, 'BOUNDARY', async () => {
        const book = makeValidBook('t14'); book.price = "-15.50";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    //CAT 4: Length Violations
    await test('T10', 'Title string length compression violation', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('t10'); book.title = "A";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T11', 'Author name length overflow ceiling breach', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('t11'); book.author = "A".repeat(101);
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T12', 'Summary block character count underflow limit', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('t12'); book.summary = "Short";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T13', 'Summary text allocation density buffer overflow', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('t13'); book.summary = "A".repeat(1001);
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T17', 'Update execution title sequence compression boundary breach', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'LENGTH', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: "X" }) });
    });

    //CAT5: Temporal Rules
    await test('T15', 'Temporal timeline future calendar allocation leak', 'POST', '/api/books', 400, 'TEMPORAL', async () => {
        const book = makeValidBook('t15'); book.year = 2030;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T19', 'Update workflow temporal timeline boundary ceiling check', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'TEMPORAL', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year: 2029 }) });
    });

    //CAT6: Safe-Write Enforcement
    await test('T04', 'Unknown Field Create', 'POST', '/api/books', 400, 'UNKNOWN_CREATE', async () => {
        const book = makeValidBook('t04'); book.maliciousFieldInject = "unauthorized_data";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T16', 'Unknown fields update modification interception', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'UNKNOWN_UPDATE', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bypassSecurityRole: true }) });
    });

    //CAT 7: Immutability Rules
    await test('T03', 'Update ID Attempt', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'IMMUTABLE', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: "hacked-id-string" }) });
    });

    //CAT8: Validation On Update Vs Create Conflicts
    await test('T20', 'Duplicate record identity conflict blocking check', 'POST', '/api/books', 409, 'CREATE_FAIL', async () => {
        const book = makeValidBook(VALID_SEEDED_ID); 
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T21', 'Target entry missing routing address exception tracking', 'PUT', '/api/books/missing-slot-id', 404, 'UPDATE_FAIL', async () => {
        return await fetch(`${SERVER_URL}/missing-slot-id`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: "Valid Title Upgrade" }) });
    });

    //Matrix Verification Checks
    await test('T22', 'Primary identity string character validation block', 'POST', '/api/books', 400, 'BOUNDARY', async () => {
        const book = makeValidBook('invalid!!!id');
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T23', 'Schema classification index enum compliance control check', 'POST', '/api/books', 400, 'BOUNDARY', async () => {
        const book = makeValidBook('t23'); book.genre = "Hacking & Exploits";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T24', 'Denomination parameter configuration constraint verification', 'POST', '/api/books', 400, 'BOUNDARY', async () => {
        const book = makeValidBook('t24'); book.currency = "USD";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('T25', 'Update workflow currency transformation constraint validation', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'BOUNDARY', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: "EUR" }) });
    });

    console.log('SUMMARY| ' + JSON.stringify(coverageTracker));
    console.log(`COVERAGE| ${globalTestFailed ? 'FAIL' : 'PASS'}`);

    process.exit(globalTestFailed ? 1 : 0);
}

runAllTests();