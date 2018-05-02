

class PatternRule {
    
    /**
    * @property {string} id
    */

    /**
    * @property {string} pattern
    */

    /**
    * @property {string} intent
    */

    
    constructor({id /* string */,pattern /* string */,intent /* string */} = {}) {
        Object.assign(this, {id /* string */,pattern /* string */,intent /* string */});
    }
}
PatternRule.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternRule.fromJSON);
    }
    
    const {id /* string */,pattern /* string */,intent /* string */} = source;
    return new PatternRule({id /* string */,pattern /* string */,intent /* string */});
};

module.exports = PatternRule;
