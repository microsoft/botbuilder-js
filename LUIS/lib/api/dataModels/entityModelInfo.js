

class EntityModelInfo {
    
    /**
    * @property {undefined} roles
    */

    
    constructor({roles /* undefined */} = {}) {
        Object.assign(this, {roles /* undefined */});
    }
}
EntityModelInfo.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntityModelInfo.fromJSON);
    }
    
    const {roles /* undefined */} = source;
    return new EntityModelInfo({roles /* undefined */});
};

module.exports = EntityModelInfo;
