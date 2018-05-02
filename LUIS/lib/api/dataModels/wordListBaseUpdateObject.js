/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class WordListBaseUpdateObject {
    
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
WordListBaseUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(WordListBaseUpdateObject.fromJSON);
    }
    
    const {canonicalForm /* string */,list /* string[] */} = source;
    return new WordListBaseUpdateObject({canonicalForm /* string */,list /* string[] */});
};

module.exports = WordListBaseUpdateObject;
