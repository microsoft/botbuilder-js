

class HierarchicalEntityModel {
    
    /**
    * @property {string[]} children
    */

    /**
    * @property {string} name
    */

    
    constructor({children /* string[] */,name /* string */} = {}) {
        Object.assign(this, {children /* string[] */,name /* string */});
    }
}
HierarchicalEntityModel.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(HierarchicalEntityModel.fromJSON);
    }
    
    const {children /* string[] */,name /* string */} = source;
    return new HierarchicalEntityModel({children /* string[] */,name /* string */});
};

module.exports = HierarchicalEntityModel;
