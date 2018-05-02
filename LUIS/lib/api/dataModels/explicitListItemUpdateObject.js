/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ExplicitListItemUpdateObject {
    
    /**
    * @property {string} explicitListItem
    */

    
    constructor({explicitListItem /* string */} = {}) {
        Object.assign(this, {explicitListItem /* string */});
    }
}
ExplicitListItemUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ExplicitListItemUpdateObject.fromJSON);
    }
    
    const {explicitListItem /* string */} = source;
    return new ExplicitListItemUpdateObject({explicitListItem /* string */});
};

module.exports = ExplicitListItemUpdateObject;
