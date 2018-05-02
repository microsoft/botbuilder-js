

class EntityExtractor {
    
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
EntityExtractor.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntityExtractor.fromJSON);
    }
    
    const {customPrebuiltDomainName /* string */,customPrebuiltModelName /* string */} = source;
    return new EntityExtractor({customPrebuiltDomainName /* string */,customPrebuiltModelName /* string */});
};

module.exports = EntityExtractor;
