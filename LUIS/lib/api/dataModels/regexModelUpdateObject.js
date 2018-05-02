/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class RegexModelUpdateObject {
    
    /**
    * @property {string} regexPattern
    */

    /**
    * @property {string} name
    */

    
    constructor({regexPattern /* string */,name /* string */} = {}) {
        Object.assign(this, {regexPattern /* string */,name /* string */});
    }
}
RegexModelUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(RegexModelUpdateObject.fromJSON);
    }
    
    const {regexPattern /* string */,name /* string */} = source;
    return new RegexModelUpdateObject({regexPattern /* string */,name /* string */});
};

module.exports = RegexModelUpdateObject;
