/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ModelCreateObject {
    
    /**
    * @property {string} name
    */

    
    constructor({name /* string */} = {}) {
        Object.assign(this, {name /* string */});
    }
}
ModelCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ModelCreateObject.fromJSON);
    }
    
    const {name /* string */} = source;
    return new ModelCreateObject({name /* string */});
};

module.exports = ModelCreateObject;
