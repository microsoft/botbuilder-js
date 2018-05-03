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

    /**
    * @property {string[]} roles
    */

    
    constructor({name /* string */,subLists /* SubClosedList[] */,roles /* string[] */} = {}) {
        Object.assign(this, {name /* string */,subLists /* SubClosedList[] */,roles /* string[] */});
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

    const {name /* string */,subLists /* SubClosedList[] */,roles /* string[] */} = source;
    return new ClosedList({name /* string */,subLists /* SubClosedList[] */,roles /* string[] */});
};

module.exports = ClosedList;
