const JSONSubClosedList = require('./jsonSubClosedList');

class JSONClosedList {

    /**
     * @property {string} name
     */

    /**
     * @property {JSONSubClosedList[]} subLists
     */


    constructor({name /* string */, subLists /* JSONSubClosedList[] */} = {}) {
        Object.assign(this, {name /* string */, subLists /* JSONSubClosedList[] */});
    }
}

JSONClosedList.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONClosedList.fromJSON);
    }

    source.subLists = JSONSubClosedList.fromJSON(source.subLists) || undefined;

    const {name /* string */, subLists /* JSONSubClosedList[] */} = source;
    return new JSONClosedList({name /* string */, subLists /* JSONSubClosedList[] */});
};

module.exports = JSONClosedList;
