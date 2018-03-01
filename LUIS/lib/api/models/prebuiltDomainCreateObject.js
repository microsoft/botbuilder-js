class PrebuiltDomainCreateObject {

    /**
     * @property {string} domainName
     */

    /**
     * @property {string} culture
     */


    constructor({domainName /* string */, culture /* string */} = {}) {
        Object.assign(this, {domainName /* string */, culture /* string */});
    }
}

PrebuiltDomainCreateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PrebuiltDomainCreateObject.fromJSON);
    }

    const {domainName /* string */, culture /* string */} = source;
    return new PrebuiltDomainCreateObject({domainName /* string */, culture /* string */});
};

module.exports = {PrebuiltDomainCreateObject};
