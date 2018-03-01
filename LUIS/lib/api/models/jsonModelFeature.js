class JSONModelFeature {

    /**
     * @property {boolean} activated
     */

    /**
     * @property {string} name
     */

    /**
     * @property {string} words
     */

    /**
     * @property {boolean} mode
     */


    constructor({activated /* boolean */, name /* string */, words /* string */, mode /* boolean */} = {}) {
        Object.assign(this, {activated /* boolean */, name /* string */, words /* string */, mode /* boolean */});
    }
}

JSONModelFeature.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONModelFeature.fromJSON);
    }

    const {activated /* boolean */, name /* string */, words /* string */, mode /* boolean */} = source;
    return new JSONModelFeature({activated /* boolean */, name /* string */, words /* string */, mode /* boolean */});
};

module.exports = {JSONModelFeature};
