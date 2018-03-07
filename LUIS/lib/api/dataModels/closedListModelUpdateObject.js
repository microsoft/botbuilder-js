const WordListCreateObject = require('./wordListCreateObject');

class ClosedListModelUpdateObject {

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

ClosedListModelUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ClosedListModelUpdateObject.fromJSON);
    }

    source.subLists = WordListCreateObject.fromJSON(source.subLists) || undefined;

    const {subLists /* WordListCreateObject[] */, name /* string */} = source;
    return new ClosedListModelUpdateObject({subLists /* WordListCreateObject[] */, name /* string */});
};

module.exports = ClosedListModelUpdateObject;
