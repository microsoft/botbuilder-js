

class EntityRoleUpdateObject {
    
    /**
    * @property {string} name
    */

    
    constructor({name /* string */} = {}) {
        Object.assign(this, {name /* string */});
    }
}
EntityRoleUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntityRoleUpdateObject.fromJSON);
    }
    
    const {name /* string */} = source;
    return new EntityRoleUpdateObject({name /* string */});
};

module.exports = EntityRoleUpdateObject;
