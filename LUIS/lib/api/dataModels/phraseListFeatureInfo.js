/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PhraseListFeatureInfo {
    
    /**
    * @property {string} phrases
    */

    /**
    * @property {boolean} isExchangeable
    */

    
    constructor({phrases /* string */,isExchangeable /* boolean */} = {}) {
        Object.assign(this, {phrases /* string */,isExchangeable /* boolean */});
    }
}
PhraseListFeatureInfo.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PhraseListFeatureInfo.fromJSON);
    }
    
    const {phrases /* string */,isExchangeable /* boolean */} = source;
    return new PhraseListFeatureInfo({phrases /* string */,isExchangeable /* boolean */});
};

module.exports = PhraseListFeatureInfo;
