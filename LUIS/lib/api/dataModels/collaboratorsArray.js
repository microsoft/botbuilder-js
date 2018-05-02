/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class CollaboratorsArray {
    
    /**
    * @property {string[]} emails
    */

    
    constructor({emails /* string[] */} = {}) {
        Object.assign(this, {emails /* string[] */});
    }
}
CollaboratorsArray.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(CollaboratorsArray.fromJSON);
    }
    
    const {emails /* string[] */} = source;
    return new CollaboratorsArray({emails /* string[] */});
};

module.exports = CollaboratorsArray;
