
const WordListObject = require('./wordListObject');

class ClosedListModelCreateObject {
    
    /**
    * @property {WordListObject[]} subLists
    */

    /**
    * @property {string} name
    */

    
    constructor({subLists /* WordListObject[] */,name /* string */} = {}) {
        Object.assign(this, {subLists /* WordListObject[] */,name /* string */});
    }
}
ClosedListModelCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ClosedListModelCreateObject.fromJSON);
    }
    
    source.subLists = WordListObject.fromJSON(source.subLists) || undefined;

    const {subLists /* WordListObject[] */,name /* string */} = source;
    return new ClosedListModelCreateObject({subLists /* WordListObject[] */,name /* string */});
};

module.exports = ClosedListModelCreateObject;
