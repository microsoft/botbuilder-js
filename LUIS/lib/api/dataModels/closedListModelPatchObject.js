
const WordListObject = require('./wordListObject');

class ClosedListModelPatchObject {
    
    /**
    * @property {WordListObject[]} subLists
    */

    
    constructor({subLists /* WordListObject[] */} = {}) {
        Object.assign(this, {subLists /* WordListObject[] */});
    }
}
ClosedListModelPatchObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ClosedListModelPatchObject.fromJSON);
    }
    
    source.subLists = WordListObject.fromJSON(source.subLists) || undefined;

    const {subLists /* WordListObject[] */} = source;
    return new ClosedListModelPatchObject({subLists /* WordListObject[] */});
};

module.exports = ClosedListModelPatchObject;
