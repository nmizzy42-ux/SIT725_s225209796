/**
 * Calculates total book order costs applying a 10% volume discount for 3+ items, plus 10% GST.
 * @param {Array} prices - Array of book prices (strings or numbers)
 * @returns {number} Final rounded total price
 */
function calculateOrderTotal(prices) {
    if (!Array.isArray(prices)) {
        throw new TypeError('Input must be an array of prices');
    }

    let subtotal = 0;
    for (const p of prices) {
        const numericPrice = parseFloat(p);
        if (isNaN(numericPrice) || numericPrice < 0) {
            throw new Error('Invalid price value encountered');
        }
        subtotal += numericPrice;
    }

    //Edge/Valid Case: Apply 10% discount if purchasing 3 or more books
    if (prices.length >= 3) {
        subtotal *= 0.90;
    }

    //Add 10% Australian GST (Tax) and round to two decimal places
    const totalWithTax = subtotal * 1.10;
    return parseFloat(totalWithTax.toFixed(2));
}

module.exports = { calculateOrderTotal };
