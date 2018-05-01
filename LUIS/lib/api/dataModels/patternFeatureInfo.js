

class PatternFeatureInfo {
    
    /**
    * @property {string} pattern
    */

    
    constructor({pattern /* string */} = {}) {
        Object.assign(this, {pattern /* string */});
    }
}
PatternFeatureInfo.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternFeatureInfo.fromJSON);
    }
    
    const {pattern /* string */} = source;
    return new PatternFeatureInfo({pattern /* string */});
};

module.exports = PatternFeatureInfo;
