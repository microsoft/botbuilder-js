const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.should();

const promisedRetry = require('../src/retry').promisedRetry;

const returnValue = function (input) {
    return input;
};

const returnPromise = function (input) {
    return Promise.resolve(input);
};

const rejectPromise = function (err) {
    return Promise.reject(err);
};

const throwError = function (err) {
    throw new Error(err);
};

const getRetryFunction = function (resultAfterRetries) {
    let turnCount = 0;
    return function (result) {
        if (resultAfterRetries >= turnCount) {
            return result;
        } else {
            turnCount++;
            throw new Error('retry: ' + turnCount);
        }
    };
};

const getPromiseBasedRetryFunction = function (resultAfterRetries) {
    let turnCount = 0;
    return function (result) {
        if (resultAfterRetries <= turnCount) {
            return result;
        } else {
            turnCount++;
            return Promise.reject('retry: ' + turnCount);
        }
    };
};

describe('retry should complete', () => {
    it('functions that return value', () => {
        promisedRetry(() => returnValue('x'), 1, 1).should.eventually.equal('x');
    });

    it('functions that return promise', () => {
        promisedRetry(() => returnPromise('x'), 1, 1).should.eventually.equal('x');
    });
});

describe('retry should fail', () => {

    it('functions that rejects a promise', () => {
        promisedRetry(function () {
            return rejectPromise('x');
        }, 1, 1).should.eventually.be.rejected;
    });

    it('functions that throw error', () => {
        return promisedRetry(function () {
            return throwError('x');
        }, 1, 1).should.eventually.be.rejectedWith('Retries exhausted.\n[\n  "Error: x"\n]');
    });

    describe('multiple retries', () => {
        it('fail after retries', () => {
            return promisedRetry(function () {
                return throwError('x');
            }, 100, 2).should.eventually.be.rejectedWith('Retries exhausted.\n[\n  "Error: x",\n  "Error: x"\n]');
        });

        describe('succeed after exceptions', () => {
            it('5 retries', () => {
                const retryFunc = getRetryFunction(5);
                return promisedRetry(function () {
                    return retryFunc('x');
                }, 100, 5).should.eventually.equal('x');
            });

            it('3 retries', () => {
                const retryFunc = getRetryFunction(3);
                return promisedRetry(function () {
                    return retryFunc('x');
                }, 100, 3).should.eventually.equal('x');
            });
        });

        describe('succeed after rejection', () => {
            it('5 retries', () => {
                const retryFunc = getPromiseBasedRetryFunction(4);
                return promisedRetry(function () {
                    return retryFunc('x');
                }, 100, 5).should.eventually.equal('x');
            });

            it('3 retries', () => {
                const retryFunc = getPromiseBasedRetryFunction(4);
                return promisedRetry(function () {
                    return retryFunc('x');
                }, 100, 5).should.eventually.equal('x');
            });
        });
    });
});
