const WordListCreateObject = require('./wordListCreateObject');

class ClosedListModelCreateObject {

    /**
     * @property {WordListCreateObject[]} subLists
     */

    /**
     * @property {string} name
     */


    constructor({subLists /* WordListCreateObject[] */, name /* string */} = {}) {
        Object.assign(this, {subLists /* WordListCreateObject[] */, name /* string */});
    }
}

ClosedListModelCreateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ClosedListModelCreateObject.fromJSON);
    }

    source.subLists = WordListCreateObject.fromJSON(source.subLists) || undefined;

    const {subLists /* WordListCreateObject[] */, name /* string */} = source;
    return new ClosedListModelCreateObject({subLists /* WordListCreateObject[] */, name /* string */});
};

module.exports = ClosedListModelCreateObject;
