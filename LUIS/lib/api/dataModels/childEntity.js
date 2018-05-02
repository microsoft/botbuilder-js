/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ChildEntity {
    
    /**
    * @property {string} id
    */

    /**
    * @property {string} name
    */

    
    constructor({id /* string */,name /* string */} = {}) {
        Object.assign(this, {id /* string */,name /* string */});
    }
}
ChildEntity.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ChildEntity.fromJSON);
    }
    
    const {id /* string */,name /* string */} = source;
    return new ChildEntity({id /* string */,name /* string */});
};

module.exports = ChildEntity;
