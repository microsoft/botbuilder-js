/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class RegexEntityExtractor {
    
    /**
    * @property {string} regexPattern
    */

    
    constructor({regexPattern /* string */} = {}) {
        Object.assign(this, {regexPattern /* string */});
    }
}
RegexEntityExtractor.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(RegexEntityExtractor.fromJSON);
    }
    
    const {regexPattern /* string */} = source;
    return new RegexEntityExtractor({regexPattern /* string */});
};

module.exports = RegexEntityExtractor;
