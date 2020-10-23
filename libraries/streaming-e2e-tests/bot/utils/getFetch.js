/**
 * Gets the fetch library.
 * @returns The fetch library.
 */
module.exports = function getFetch() {
    if (!global.hasOwnProperty('fetch')) {
        global.fetch = require('node-fetch');
    }
    return global.fetch;
}
