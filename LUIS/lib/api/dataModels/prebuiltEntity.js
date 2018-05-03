/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PrebuiltEntity {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string[]} roles
    */

    
    constructor({name /* string */,roles /* string[] */} = {}) {
        Object.assign(this, {name /* string */,roles /* string[] */});
    }
}
PrebuiltEntity.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PrebuiltEntity.fromJSON);
    }
    
    const {name /* string */,roles /* string[] */} = source;
    return new PrebuiltEntity({name /* string */,roles /* string[] */});
};

module.exports = PrebuiltEntity;
