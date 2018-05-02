/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PatternAnyEntityExtractor {
    
    /**
    * @property {undefined} explicitList
    */

    
    constructor({explicitList /* undefined */} = {}) {
        Object.assign(this, {explicitList /* undefined */});
    }
}
PatternAnyEntityExtractor.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternAnyEntityExtractor.fromJSON);
    }
    
    const {explicitList /* undefined */} = source;
    return new PatternAnyEntityExtractor({explicitList /* undefined */});
};

module.exports = PatternAnyEntityExtractor;
