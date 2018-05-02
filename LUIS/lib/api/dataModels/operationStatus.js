/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class OperationStatus {
    
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
OperationStatus.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(OperationStatus.fromJSON);
    }
    
    const {code /* string */,message /* string */} = source;
    return new OperationStatus({code /* string */,message /* string */});
};

module.exports = OperationStatus;
