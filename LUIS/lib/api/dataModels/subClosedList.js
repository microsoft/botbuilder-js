

class SubClosedList {
    
    /**
    * @property {string} canonicalForm
    */

    /**
    * @property {string[]} list
    */

    
    constructor({canonicalForm /* string */,list /* string[] */} = {}) {
        Object.assign(this, {canonicalForm /* string */,list /* string[] */});
    }
}
SubClosedList.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(SubClosedList.fromJSON);
    }
    
    const {canonicalForm /* string */,list /* string[] */} = source;
    return new SubClosedList({canonicalForm /* string */,list /* string[] */});
};

module.exports = SubClosedList;
