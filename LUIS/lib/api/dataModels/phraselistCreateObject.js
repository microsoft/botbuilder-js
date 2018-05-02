/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PhraselistCreateObject {
    
    /**
    * @property {string} phrases
    */

    /**
    * @property {string} name
    */

    /**
    * @property {boolean} isExchangeable
    */

    
    constructor({phrases /* string */,name /* string */,isExchangeable /* boolean */} = {}) {
        Object.assign(this, {phrases /* string */,name /* string */,isExchangeable /* boolean */});
    }
}
PhraselistCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PhraselistCreateObject.fromJSON);
    }
    
    const {phrases /* string */,name /* string */,isExchangeable /* boolean */} = source;
    return new PhraselistCreateObject({phrases /* string */,name /* string */,isExchangeable /* boolean */});
};

module.exports = PhraselistCreateObject;
