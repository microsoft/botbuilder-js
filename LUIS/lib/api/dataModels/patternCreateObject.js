

class PatternCreateObject {
    
    /**
    * @property {string} pattern
    */

    /**
    * @property {string} name
    */

    
    constructor({pattern /* string */,name /* string */} = {}) {
        Object.assign(this, {pattern /* string */,name /* string */});
    }
}
PatternCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternCreateObject.fromJSON);
    }
    
    const {pattern /* string */,name /* string */} = source;
    return new PatternCreateObject({pattern /* string */,name /* string */});
};

module.exports = PatternCreateObject;
