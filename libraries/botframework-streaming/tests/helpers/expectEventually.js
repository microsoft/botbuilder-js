/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { expect } = require('chai');

// chai-as-promised is not actively maintained, we need to build something simple.

module.exports.expectEventually = async function (promise) {
    let error, result;

    try {
        result = await promise;
    } catch (e) {
        error = e;
    }

    if (error) {
        return expect(() => {
            throw error;
        });
    } else {
        return expect(result);
    }
};
