class JSONRegexFeature {

    /**
     * @property {string} pattern
     */

    /**
     * @property {boolean} activated
     */

    /**
     * @property {string} name
     */


    constructor({pattern /* string */, activated /* boolean */, name /* string */} = {}) {
        Object.assign(this, {pattern /* string */, activated /* boolean */, name /* string */});
    }
}

JSONRegexFeature.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONRegexFeature.fromJSON);
    }

    const {pattern /* string */, activated /* boolean */, name /* string */} = source;
    return new JSONRegexFeature({pattern /* string */, activated /* boolean */, name /* string */});
};

module.exports = {JSONRegexFeature};
