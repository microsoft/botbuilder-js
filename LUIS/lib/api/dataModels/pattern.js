/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class Pattern {
    
    /**
    * @property {string} pattern
    */

    /**
    * @property {string} intent
    */

    
    constructor({pattern /* string */,intent /* string */} = {}) {
        Object.assign(this, {pattern /* string */,intent /* string */});
    }
}
Pattern.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(Pattern.fromJSON);
    }
    
    const {pattern /* string */,intent /* string */} = source;
    return new Pattern({pattern /* string */,intent /* string */});
};

module.exports = Pattern;
