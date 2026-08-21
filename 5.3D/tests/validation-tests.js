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
    IMMUTABLE: 0,
    ENUM: 0
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

    // MODULE 1: CREATE (POST) NEGATIVE VALIDATION

    // 1.1 Required Fields (CREATE)
    await test('C-REQ-01', 'Missing Title', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('c_req01'); delete book.title;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-REQ-02', 'Missing Author', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('c_req02'); delete book.author;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-REQ-03', 'Missing Summary', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('c_req03'); delete book.summary;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-REQ-04', 'Missing Genre', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('c_req04'); delete book.genre;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-REQ-05', 'Missing Price', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('c_req05'); delete book.price;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-REQ-06', 'Missing Currency', 'POST', '/api/books', 400, 'REQUIRED', async () => {
        const book = makeValidBook('c_req06'); delete book.currency;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    // 1.2 Type Checks (CREATE)
    await test('C-TYP-01', 'Year as String Primitive', 'POST', '/api/books', 400, 'TYPE', async () => {
        const book = makeValidBook('c_typ01'); book.year = "2024";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-TYP-02', 'Title as Number', 'POST', '/api/books', 400, 'TYPE', async () => {
        const book = makeValidBook('c_typ02'); book.title = 12345;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-TYP-03', 'Author as Object Injection', 'POST', '/api/books', 400, 'TYPE', async () => {
        const book = makeValidBook('c_typ03'); book.author = { name: "Terry Pratchett" };
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-TYP-04', 'Genre as Number', 'POST', '/api/books', 400, 'TYPE', async () => {
        const book = makeValidBook('c_typ04'); book.genre = 123;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-TYP-05', 'Price as Alphabetic String', 'POST', '/api/books', 400, 'TYPE', async () => {
        const book = makeValidBook('c_typ05'); book.price = "Twenty Nine Dollars";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    // 1.3 ID Character Regex Enforcements
    await test('C-ID-01', 'ID with illegal characters', 'POST', '/api/books', 400, 'BOUNDARY', async () => {
        const book = makeValidBook('invalid!!!id');
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    // 1.4 Length Constraints (CREATE)
    await test('C-LEN-01', 'Title Min Underflow (1 char)', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('c_len01'); book.title = "A";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-LEN-02', 'Title Max Overflow (151 chars)', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('c_len02'); book.title = "A".repeat(151);
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-LEN-03', 'Author Min Underflow (1 char)', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('c_len03'); book.author = "A";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-LEN-04', 'Author Max Overflow (101 chars)', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('c_len04'); book.author = "A".repeat(101);
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-LEN-05', 'Summary Min Underflow (9 chars)', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('c_len05'); book.summary = "Short 123";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-LEN-06', 'Summary Max Overflow (1001 chars)', 'POST', '/api/books', 400, 'LENGTH', async () => {
        const book = makeValidBook('c_len06'); book.summary = "A".repeat(1001);
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    // 1.5 Numerical Boundaries & Enums (CREATE)
    await test('C-BND-01', 'Year below Diamond Sutra landmark (867)', 'POST', '/api/books', 400, 'BOUNDARY', async () => {
        const book = makeValidBook('c_bnd01'); book.year = 867;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-TEM-01', 'Year above maximum limit (2027)', 'POST', '/api/books', 400, 'TEMPORAL', async () => {
        const book = makeValidBook('c_tem01'); book.year = 2027;
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-BND-02', 'Negative Price assignment', 'POST', '/api/books', 400, 'BOUNDARY', async () => {
        const book = makeValidBook('c_bnd02'); book.price = "-0.01";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-ENM-01', 'Genre non-allowed catalog token', 'POST', '/api/books', 400, 'ENUM', async () => {
        const book = makeValidBook('c_enm01'); book.genre = "Hacking & Exploits";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('C-ENM-02', 'Currency geographical mismatch token', 'POST', '/api/books', 400, 'ENUM', async () => {
        const book = makeValidBook('c_enm02'); book.currency = "USD";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    // MODULE 2: UPDATE (PUT) NEGATIVE VALIDATION

    // 2.1 Missing Payload Validation (Null/Blank updates across required constraints)
    await test('U-REQ-01', 'Update Title to Empty String', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'REQUIRED', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: "" }) });
    });

    await test('U-REQ-02', 'Update Author to Empty String', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'REQUIRED', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: "" }) });
    });

    await test('U-REQ-03', 'Update Summary to Empty String', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'REQUIRED', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary: "" }) });
    });

    // 2.2 Type Constraints (UPDATE)
    await test('U-TYP-01', 'Update pipeline type coercion rejection (Year String)', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'TYPE', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year: "1995" }) });
    });

    await test('U-TYP-02', 'Update Title as Object Type Injection', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'TYPE', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: { nested: "Malicious" } }) });
    });

    // 2.3 Length Constraints (UPDATE)
    await test('U-LEN-01', 'Update Title Min Underflow', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'LENGTH', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: "X" }) });
    });

    await test('U-LEN-02', 'Update Title Max Overflow (151 chars)', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'LENGTH', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: "X".repeat(151) }) });
    });

    await test('U-LEN-03', 'Update Author Min Underflow', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'LENGTH', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: "Z" }) });
    });

    await test('U-LEN-04', 'Update Author Max Overflow (101 chars)', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'LENGTH', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: "Z".repeat(101) }) });
    });

    await test('U-LEN-05', 'Update Summary Min Underflow', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'LENGTH', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary: "Too tiny" }) });
    });

    await test('U-LEN-06', 'Update Summary Max Overflow (1001 chars)', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'LENGTH', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary: "Z".repeat(1001) }) });
    });

    // 2.4 Numerical Boundaries & Enums (UPDATE)
    await test('U-BND-01', 'Update Year below historic printing boundary', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'BOUNDARY', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year: 500 }) });
    });

    await test('U-TEM-01', 'Update Year above timeline ceiling (2027)', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'TEMPORAL', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year: 2027 }) });
    });

    await test('U-BND-02', 'Update Price to negative domain error', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'BOUNDARY', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price: "-99.95" }) });
    });

    await test('U-ENM-01', 'Update Genre transformation error against list pool', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'ENUM', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ genre: "Cyberpunk" }) });
    });

    await test('U-ENM-02', 'Update Currency token breach parameter configuration', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'ENUM', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: "EUR" }) });
    });

    // MODULE 3: SAFE-WRITE, IMMUTABILITY & COLLISION

    // 3.1 Unmapped Parameters (Safe-Write Design Verification)
    await test('S-WRT-01', 'Unknown Field Injection Blocking on Create', 'POST', '/api/books', 400, 'UNKNOWN_CREATE', async () => {
        const book = makeValidBook('s_wrt01');
        book.maliciousFieldInject = "unauthorized_data";
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('S-WRT-02', 'Unknown fields update interception mechanism', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'UNKNOWN_UPDATE', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bypassSecurityRole: true }) });
    });

    // 3.2 Key Record Identity Lifecycles
    await test('S-IMM-01', 'Identity Immutability Anchor Check', 'PUT', `/api/books/${VALID_SEEDED_ID}`, 400, 'IMMUTABLE', async () => {
        return await fetch(`${SERVER_URL}/${VALID_SEEDED_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: "hacked-id-string" }) });
    });

    await test('S-COL-01', 'Primary Key Conflict Collision Prevention', 'POST', '/api/books', 409, 'CREATE_FAIL', async () => {
        const book = makeValidBook(VALID_SEEDED_ID);
        return await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
    });

    await test('S-RTE-01', 'Missing Target Document Router Return Exception tracking', 'PUT', '/api/books/missing-slot-id', 404, 'UPDATE_FAIL', async () => {
        return await fetch(`${SERVER_URL}/missing-slot-id`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: "Valid Title Upgrade" }) });
    });

    // Final Metric Telemetry Outputs
    console.log('SUMMARY| ' + JSON.stringify(coverageTracker));
    console.log(`COVERAGE| ${globalTestFailed ? 'FAIL' : 'PASS'}`);
    process.exit(globalTestFailed ? 1 : 0);
}

runAllTests();