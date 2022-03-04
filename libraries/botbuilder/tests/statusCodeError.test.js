/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { StatusCodeError } = require('../');
const { StatusCodes } = require('botbuilder-core');

describe('StatusCodeError', function () {
    describe('constructor()', function () {
        it('should work with a message.', function () {
            const message = 'This is an error message';
            const error = new StatusCodeError(StatusCodes.NOT_FOUND, message);

            assert.strictEqual(error.message, message, `message should be equal to "${message}".`);
            assert.strictEqual(
                error.statusCode,
                StatusCodes.NOT_FOUND,
                `statusCode should be the code ${StatusCodes.NOT_FOUND}`
            );
        });

        it('should work without a message.', function () {
            const error = new StatusCodeError(StatusCodes.NOT_FOUND);

            assert.strictEqual(error.message, '', 'message should be empty.');
            assert.strictEqual(
                error.statusCode,
                StatusCodes.NOT_FOUND,
                `statusCode should be the code ${StatusCodes.NOT_FOUND}`
            );
        });

        it('should statusCode be undefined if not passed as a parameter.', function () {
            const error = new StatusCodeError();

            assert.strictEqual(error.statusCode, undefined, 'statusCode should be undefined.');
        });
    });
});
