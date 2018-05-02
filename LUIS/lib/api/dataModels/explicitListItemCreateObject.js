/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ExplicitListItemCreateObject {
    
    /**
    * @property {string} explicitListItem
    */

    
    constructor({explicitListItem /* string */} = {}) {
        Object.assign(this, {explicitListItem /* string */});
    }
}
ExplicitListItemCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ExplicitListItemCreateObject.fromJSON);
    }
    
    const {explicitListItem /* string */} = source;
    return new ExplicitListItemCreateObject({explicitListItem /* string */});
};

module.exports = ExplicitListItemCreateObject;
