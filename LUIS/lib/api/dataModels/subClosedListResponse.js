/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class SubClosedListResponse {
    
    /**
    * @property {integer} id
    */

    
    constructor({id /* integer */} = {}) {
        Object.assign(this, {id /* integer */});
    }
}
SubClosedListResponse.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(SubClosedListResponse.fromJSON);
    }
    
    const {id /* integer */} = source;
    return new SubClosedListResponse({id /* integer */});
};

module.exports = SubClosedListResponse;
