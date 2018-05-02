

class ApplicationUpdateObject {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string} description
    */

    
    constructor({name /* string */,description /* string */} = {}) {
        Object.assign(this, {name /* string */,description /* string */});
    }
}
ApplicationUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationUpdateObject.fromJSON);
    }
    
    const {name /* string */,description /* string */} = source;
    return new ApplicationUpdateObject({name /* string */,description /* string */});
};

module.exports = ApplicationUpdateObject;
