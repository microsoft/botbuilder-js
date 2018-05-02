

class IntentClassifier {
    
    /**
    * @property {string} customPrebuiltDomainName
    */

    /**
    * @property {string} customPrebuiltModelName
    */

    
    constructor({customPrebuiltDomainName /* string */,customPrebuiltModelName /* string */} = {}) {
        Object.assign(this, {customPrebuiltDomainName /* string */,customPrebuiltModelName /* string */});
    }
}
IntentClassifier.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(IntentClassifier.fromJSON);
    }
    
    const {customPrebuiltDomainName /* string */,customPrebuiltModelName /* string */} = source;
    return new IntentClassifier({customPrebuiltDomainName /* string */,customPrebuiltModelName /* string */});
};

module.exports = IntentClassifier;
