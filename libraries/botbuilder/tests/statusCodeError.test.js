/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { StatusCodeError } = require('../');
const { StatusCodes } = require('botbuilder-core');

describe(`StatusCodeError`, function() {
    describe('constructor()', () => {
        it(`should work with a message.`, done => {
            try {
                const message = 'This is an error message';
                const error = new StatusCodeError(StatusCodes.NOT_FOUND, message);

                assert.strictEqual(error.message, message, `message should be equal to "${ message }".`);
                assert.strictEqual(error.statusCode, StatusCodes.NOT_FOUND, `statusCode should be the code ${ StatusCodes.NOT_FOUND }`);
                done();
            } catch (error) {
                done(error);
            }
        });

        it(`should work without a message.`, done => {
            try {
                const error = new StatusCodeError(StatusCodes.NOT_FOUND);

                assert.strictEqual(error.message, '', 'message should be empty.');
                assert.strictEqual(error.statusCode, StatusCodes.NOT_FOUND, `statusCode should be the code ${ StatusCodes.NOT_FOUND }`);
                done();
            } catch (error) {
                done(error);
            }
        });

        it(`should statusCode be undefined if not passed as a parameter.`, done => {
            try {
                const error = new StatusCodeError();

                assert.strictEqual(error.statusCode, undefined, 'statusCode should be undefined.');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});
