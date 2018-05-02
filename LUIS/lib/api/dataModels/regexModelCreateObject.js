

class RegexModelCreateObject {
    
    /**
    * @property {string} regexPattern
    */

    /**
    * @property {string} name
    */

    
    constructor({regexPattern /* string */,name /* string */} = {}) {
        Object.assign(this, {regexPattern /* string */,name /* string */});
    }
}
RegexModelCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(RegexModelCreateObject.fromJSON);
    }
    
    const {regexPattern /* string */,name /* string */} = source;
    return new RegexModelCreateObject({regexPattern /* string */,name /* string */});
};

module.exports = RegexModelCreateObject;
