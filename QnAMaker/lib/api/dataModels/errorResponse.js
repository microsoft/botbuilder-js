/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class ErrorResponse {
    
    /**
    * @property {undefined} error
    */

    
    constructor({error /* undefined */} = {}) {
        Object.assign(this, {error /* undefined */});
    }
}
ErrorResponse.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(ErrorResponse.fromJSON);
    }
    
    const {error /* undefined */} = src;
    return new ErrorResponse({error /* undefined */});
};

module.exports = ErrorResponse;
