/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PatternAny {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string[]} explicitList
    */

    /**
    * @property {string[]} roles
    */

    
    constructor({name /* string */,explicitList /* string[] */,roles /* string[] */} = {}) {
        Object.assign(this, {name /* string */,explicitList /* string[] */,roles /* string[] */});
    }
}
PatternAny.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternAny.fromJSON);
    }
    
    const {name /* string */,explicitList /* string[] */,roles /* string[] */} = source;
    return new PatternAny({name /* string */,explicitList /* string[] */,roles /* string[] */});
};

module.exports = PatternAny;
