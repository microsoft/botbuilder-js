/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ErrorResponse {
    
    /**
    * @property {string} errorType
    */

    
    constructor({errorType /* string */} = {}) {
        Object.assign(this, {errorType /* string */});
    }
}
ErrorResponse.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ErrorResponse.fromJSON);
    }
    
    const {errorType /* string */} = source;
    return new ErrorResponse({errorType /* string */});
};

module.exports = ErrorResponse;
