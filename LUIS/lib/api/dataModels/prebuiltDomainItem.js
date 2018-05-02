/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PrebuiltDomainItem {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string} description
    */

    /**
    * @property {string} examples
    */

    
    constructor({name /* string */,description /* string */,examples /* string */} = {}) {
        Object.assign(this, {name /* string */,description /* string */,examples /* string */});
    }
}
PrebuiltDomainItem.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PrebuiltDomainItem.fromJSON);
    }
    
    const {name /* string */,description /* string */,examples /* string */} = source;
    return new PrebuiltDomainItem({name /* string */,description /* string */,examples /* string */});
};

module.exports = PrebuiltDomainItem;
