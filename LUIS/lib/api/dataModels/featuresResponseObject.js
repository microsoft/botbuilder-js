/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class FeaturesResponseObject {
    
    /**
    * @property {undefined} phraselistFeatures
    */

    /**
    * @property {undefined} patternFeatures
    */

    
    constructor({phraselistFeatures /* undefined */,patternFeatures /* undefined */} = {}) {
        Object.assign(this, {phraselistFeatures /* undefined */,patternFeatures /* undefined */});
    }
}
FeaturesResponseObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(FeaturesResponseObject.fromJSON);
    }
    
    const {phraselistFeatures /* undefined */,patternFeatures /* undefined */} = source;
    return new FeaturesResponseObject({phraselistFeatures /* undefined */,patternFeatures /* undefined */});
};

module.exports = FeaturesResponseObject;
