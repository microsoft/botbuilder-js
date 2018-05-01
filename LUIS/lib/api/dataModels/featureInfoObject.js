

class FeatureInfoObject {
    
    /**
    * @property {integer} id
    */

    /**
    * @property {string} name
    */

    /**
    * @property {boolean} isActive
    */

    
    constructor({id /* integer */,name /* string */,isActive /* boolean */} = {}) {
        Object.assign(this, {id /* integer */,name /* string */,isActive /* boolean */});
    }
}
FeatureInfoObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(FeatureInfoObject.fromJSON);
    }
    
    const {id /* integer */,name /* string */,isActive /* boolean */} = source;
    return new FeatureInfoObject({id /* integer */,name /* string */,isActive /* boolean */});
};

module.exports = FeatureInfoObject;
