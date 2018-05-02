

class PrebuiltDomainCreateBaseObject {
    
    /**
    * @property {string} domainName
    */

    
    constructor({domainName /* string */} = {}) {
        Object.assign(this, {domainName /* string */});
    }
}
PrebuiltDomainCreateBaseObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PrebuiltDomainCreateBaseObject.fromJSON);
    }
    
    const {domainName /* string */} = source;
    return new PrebuiltDomainCreateBaseObject({domainName /* string */});
};

module.exports = PrebuiltDomainCreateBaseObject;
