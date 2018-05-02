

class EntityLabel {
    
    /**
    * @property {string} entityName
    */

    /**
    * @property {integer} startTokenIndex
    */

    /**
    * @property {integer} endTokenIndex
    */

    
    constructor({entityName /* string */,startTokenIndex /* integer */,endTokenIndex /* integer */} = {}) {
        Object.assign(this, {entityName /* string */,startTokenIndex /* integer */,endTokenIndex /* integer */});
    }
}
EntityLabel.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntityLabel.fromJSON);
    }
    
    const {entityName /* string */,startTokenIndex /* integer */,endTokenIndex /* integer */} = source;
    return new EntityLabel({entityName /* string */,startTokenIndex /* integer */,endTokenIndex /* integer */});
};

module.exports = EntityLabel;
