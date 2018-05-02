

class PatternAnyModelCreateObject {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string[]} explicitList
    */

    
    constructor({name /* string */,explicitList /* string[] */} = {}) {
        Object.assign(this, {name /* string */,explicitList /* string[] */});
    }
}
PatternAnyModelCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternAnyModelCreateObject.fromJSON);
    }
    
    const {name /* string */,explicitList /* string[] */} = source;
    return new PatternAnyModelCreateObject({name /* string */,explicitList /* string[] */});
};

module.exports = PatternAnyModelCreateObject;
