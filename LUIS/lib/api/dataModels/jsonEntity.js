class JSONEntity {

    /**
     * @property {integer} startPos
     */

    /**
     * @property {integer} endPos
     */

    /**
     * @property {string} entity
     */


    constructor({startPos /* integer */, endPos /* integer */, entity /* string */} = {}) {
        Object.assign(this, {startPos /* integer */, endPos /* integer */, entity /* string */});
    }
}

JSONEntity.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONEntity.fromJSON);
    }

    const {startPos /* integer */, endPos /* integer */, entity /* string */} = source;
    return new JSONEntity({startPos /* integer */, endPos /* integer */, entity /* string */});
};

module.exports = JSONEntity;
