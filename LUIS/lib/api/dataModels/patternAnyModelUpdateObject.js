

class PatternAnyModelUpdateObject {
    
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
PatternAnyModelUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternAnyModelUpdateObject.fromJSON);
    }
    
    const {name /* string */,explicitList /* string[] */} = source;
    return new PatternAnyModelUpdateObject({name /* string */,explicitList /* string[] */});
};

module.exports = PatternAnyModelUpdateObject;
