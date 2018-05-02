/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ModelUpdateObject {
    
    /**
    * @property {string} name
    */

    
    constructor({name /* string */} = {}) {
        Object.assign(this, {name /* string */});
    }
}
ModelUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ModelUpdateObject.fromJSON);
    }
    
    const {name /* string */} = source;
    return new ModelUpdateObject({name /* string */});
};

module.exports = ModelUpdateObject;
