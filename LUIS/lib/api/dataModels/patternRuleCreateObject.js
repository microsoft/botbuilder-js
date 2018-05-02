/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PatternRuleCreateObject {
    
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
PatternRuleCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternRuleCreateObject.fromJSON);
    }
    
    const {pattern /* string */,intent /* string */} = source;
    return new PatternRuleCreateObject({pattern /* string */,intent /* string */});
};

module.exports = PatternRuleCreateObject;
