class ExternalKeyUpdateObject {

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

ExternalKeyUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ExternalKeyUpdateObject.fromJSON);
    }

    const {type /* string */, value /* string */} = source;
    return new ExternalKeyUpdateObject({type /* string */, value /* string */});
};

module.exports = ExternalKeyUpdateObject;
