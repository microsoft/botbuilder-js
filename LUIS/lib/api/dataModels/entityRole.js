

class EntityRole {
    
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
EntityRole.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntityRole.fromJSON);
    }
    
    const {id /* string */,name /* string */} = source;
    return new EntityRole({id /* string */,name /* string */});
};

module.exports = EntityRole;
