/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class EntityRoleCreateObject {
    
    /**
    * @property {string} name
    */

    
    constructor({name /* string */} = {}) {
        Object.assign(this, {name /* string */});
    }
}
EntityRoleCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntityRoleCreateObject.fromJSON);
    }
    
    const {name /* string */} = source;
    return new EntityRoleCreateObject({name /* string */});
};

module.exports = EntityRoleCreateObject;
