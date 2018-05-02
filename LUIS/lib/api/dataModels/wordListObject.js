/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class WordListObject {
    
    /**
    * @property {string} canonicalForm
    */

    /**
    * @property {string[]} list
    */

    
    constructor({canonicalForm /* string */,list /* string[] */} = {}) {
        Object.assign(this, {canonicalForm /* string */,list /* string[] */});
    }
}
WordListObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(WordListObject.fromJSON);
    }
    
    const {canonicalForm /* string */,list /* string[] */} = source;
    return new WordListObject({canonicalForm /* string */,list /* string[] */});
};

module.exports = WordListObject;
