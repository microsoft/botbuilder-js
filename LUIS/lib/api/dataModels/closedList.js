/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const SubClosedList = require('./subClosedList');

class ClosedList {
    
    /**
    * @property {string} name
    */

    /**
    * @property {SubClosedList[]} subLists
    */

    
    constructor({name /* string */,subLists /* SubClosedList[] */} = {}) {
        Object.assign(this, {name /* string */,subLists /* SubClosedList[] */});
    }
}
ClosedList.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ClosedList.fromJSON);
    }
    
    source.subLists = SubClosedList.fromJSON(source.subLists) || undefined;

    const {name /* string */,subLists /* SubClosedList[] */} = source;
    return new ClosedList({name /* string */,subLists /* SubClosedList[] */});
};

module.exports = ClosedList;
