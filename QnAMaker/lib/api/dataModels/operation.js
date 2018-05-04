/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class Operation {
    
    /**
    * @property {undefined} operationState
    */

    /**
    * @property {string} createdTimestamp
    */

    /**
    * @property {string} lastActionTimestamp
    */

    /**
    * @property {string} resourceLocation
    */

    /**
    * @property {string} userId
    */

    /**
    * @property {string} operationId
    */

    /**
    * @property {undefined} errorResponse
    */

    
    constructor({operationState /* undefined */,createdTimestamp /* string */,lastActionTimestamp /* string */,resourceLocation /* string */,userId /* string */,operationId /* string */,errorResponse /* undefined */} = {}) {
        Object.assign(this, {operationState /* undefined */,createdTimestamp /* string */,lastActionTimestamp /* string */,resourceLocation /* string */,userId /* string */,operationId /* string */,errorResponse /* undefined */});
    }
}
Operation.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(Operation.fromJSON);
    }
    
    const {operationState /* undefined */,createdTimestamp /* string */,lastActionTimestamp /* string */,resourceLocation /* string */,userId /* string */,operationId /* string */,errorResponse /* undefined */} = src;
    return new Operation({operationState /* undefined */,createdTimestamp /* string */,lastActionTimestamp /* string */,resourceLocation /* string */,userId /* string */,operationId /* string */,errorResponse /* undefined */});
};

module.exports = Operation;
