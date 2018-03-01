class ExternalKeyCreateObject {

    /**
     * @property {string} type
     */

    /**
     * @property {string} value
     */


    constructor({type /* string */, value /* string */} = {}) {
        Object.assign(this, {type /* string */, value /* string */});
    }
}

ExternalKeyCreateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ExternalKeyCreateObject.fromJSON);
    }

    const {type /* string */, value /* string */} = source;
    return new ExternalKeyCreateObject({type /* string */, value /* string */});
};

module.exports = {ExternalKeyCreateObject};
