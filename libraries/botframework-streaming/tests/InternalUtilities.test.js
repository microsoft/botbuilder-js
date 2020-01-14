const { isBrowser } = require('../lib/utilities');
const chai = require('chai');
const expect = chai.expect;

describe('Internal Utilities', () => {
    it('isBrowser() should return false when being run via Node.js', () => {
        // More specifically, it should return false when the global object is not window.
        expect(isBrowser()).to.be.false;
    });
});
