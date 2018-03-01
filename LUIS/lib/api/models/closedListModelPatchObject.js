const WordListCreateObject = require('./wordListCreateObject');

class ClosedListModelPatchObject {

    /**
     * @property {WordListCreateObject[]} subLists
     */


    constructor({subLists /* WordListCreateObject[] */} = {}) {
        Object.assign(this, {subLists /* WordListCreateObject[] */});
    }
}

ClosedListModelPatchObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ClosedListModelPatchObject.fromJSON);
    }

    source.subLists = WordListCreateObject.fromJSON(source.subLists) || undefined;

    const {subLists /* WordListCreateObject[] */} = source;
    return new ClosedListModelPatchObject({subLists /* WordListCreateObject[] */});
};

module.exports = {ClosedListModelPatchObject};
