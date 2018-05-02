

class HierarchicalChildEntity {
    
    /**
    * @property {integer} typeId
    */

    /**
    * @property {undefined} readableType
    */

    
    constructor({typeId /* integer */,readableType /* undefined */} = {}) {
        Object.assign(this, {typeId /* integer */,readableType /* undefined */});
    }
}
HierarchicalChildEntity.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(HierarchicalChildEntity.fromJSON);
    }
    
    const {typeId /* integer */,readableType /* undefined */} = source;
    return new HierarchicalChildEntity({typeId /* integer */,readableType /* undefined */});
};

module.exports = HierarchicalChildEntity;
