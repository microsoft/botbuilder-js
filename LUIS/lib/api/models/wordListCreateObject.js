class WordListCreateObject {

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

WordListCreateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(WordListCreateObject.fromJSON);
    }

    const {canonicalForm /* string */, list /* string[] */} = source;
    return new WordListCreateObject({canonicalForm /* string */, list /* string[] */});
};

module.exports = {WordListCreateObject};
