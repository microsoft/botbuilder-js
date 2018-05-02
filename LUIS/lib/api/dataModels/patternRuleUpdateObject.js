/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PatternRuleUpdateObject {
    
    /**
    * @property {string} id
    */

    /**
    * @property {string} pattern
    */

    /**
    * @property {string} intent
    */

    
    constructor({id /* string */,pattern /* string */,intent /* string */} = {}) {
        Object.assign(this, {id /* string */,pattern /* string */,intent /* string */});
    }
}
PatternRuleUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternRuleUpdateObject.fromJSON);
    }
    
    const {id /* string */,pattern /* string */,intent /* string */} = source;
    return new PatternRuleUpdateObject({id /* string */,pattern /* string */,intent /* string */});
};

module.exports = PatternRuleUpdateObject;
