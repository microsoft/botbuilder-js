class PatternUpdateObject {

    /**
     * @property {string} pattern
     */

    /**
     * @property {string} name
     */

    /**
     * @property {boolean} isActive
     */


    constructor({pattern /* string */, name /* string */, isActive /* boolean */} = {}) {
        Object.assign(this, {pattern /* string */, name /* string */, isActive /* boolean */});
    }
}

PatternUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PatternUpdateObject.fromJSON);
    }

    const {pattern /* string */, name /* string */, isActive /* boolean */} = source;
    return new PatternUpdateObject({pattern /* string */, name /* string */, isActive /* boolean */});
};

module.exports = PatternUpdateObject;
