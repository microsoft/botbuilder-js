class PrebuiltDomainModelCreateObject {

    /**
     * @property {string} domainName
     */

    /**
     * @property {string} modelName
     */


    constructor({domainName /* string */, modelName /* string */} = {}) {
        Object.assign(this, {domainName /* string */, modelName /* string */});
    }
}

PrebuiltDomainModelCreateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PrebuiltDomainModelCreateObject.fromJSON);
    }

    const {domainName /* string */, modelName /* string */} = source;
    return new PrebuiltDomainModelCreateObject({domainName /* string */, modelName /* string */});
};

module.exports = {PrebuiltDomainModelCreateObject};
