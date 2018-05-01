

class EntityPrediction {
    
    /**
    * @property {string} entityName
    */

    /**
    * @property {integer} startTokenIndex
    */

    /**
    * @property {integer} endTokenIndex
    */

    /**
    * @property {string} phrase
    */

    
    constructor({entityName /* string */,startTokenIndex /* integer */,endTokenIndex /* integer */,phrase /* string */} = {}) {
        Object.assign(this, {entityName /* string */,startTokenIndex /* integer */,endTokenIndex /* integer */,phrase /* string */});
    }
}
EntityPrediction.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntityPrediction.fromJSON);
    }
    
    const {entityName /* string */,startTokenIndex /* integer */,endTokenIndex /* integer */,phrase /* string */} = source;
    return new EntityPrediction({entityName /* string */,startTokenIndex /* integer */,endTokenIndex /* integer */,phrase /* string */});
};

module.exports = EntityPrediction;
