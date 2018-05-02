/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class OperationError {
    
    /**
    * @property {string} code
    */

    /**
    * @property {string} message
    */

    
    constructor({code /* string */,message /* string */} = {}) {
        Object.assign(this, {code /* string */,message /* string */});
    }
}
OperationError.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(OperationError.fromJSON);
    }
    
    const {code /* string */,message /* string */} = source;
    return new OperationError({code /* string */,message /* string */});
};

module.exports = OperationError;
