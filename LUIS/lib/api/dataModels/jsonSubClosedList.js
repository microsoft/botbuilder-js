class JSONSubClosedList {

    /**
     * @property {string} canonicalForm
     */

    /**
     * @property {string[]} list
     */


    constructor({canonicalForm /* string */, list /* string[] */} = {}) {
        Object.assign(this, {canonicalForm /* string */, list /* string[] */});
    }
}

JSONSubClosedList.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONSubClosedList.fromJSON);
    }

    const {canonicalForm /* string */, list /* string[] */} = source;
    return new JSONSubClosedList({canonicalForm /* string */, list /* string[] */});
};

module.exports = JSONSubClosedList;
