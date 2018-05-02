/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const WordListObject = require('./wordListObject');

class ClosedListModelUpdateObject {
    
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
ClosedListModelUpdateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ClosedListModelUpdateObject.fromJSON);
    }
    
    source.subLists = WordListObject.fromJSON(source.subLists) || undefined;

    const {subLists /* WordListObject[] */,name /* string */} = source;
    return new ClosedListModelUpdateObject({subLists /* WordListObject[] */,name /* string */});
};

module.exports = ClosedListModelUpdateObject;
