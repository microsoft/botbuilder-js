class HierarchicalModelUpdateObject {

    /**
     * @property {string[]} children
     */

    /**
     * @property {string} name
     */


    constructor({children /* string[] */, name /* string */} = {}) {
        Object.assign(this, {children /* string[] */, name /* string */});
    }
}

HierarchicalModelUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(HierarchicalModelUpdateObject.fromJSON);
    }

    const {children /* string[] */, name /* string */} = source;
    return new HierarchicalModelUpdateObject({children /* string[] */, name /* string */});
};

module.exports = {HierarchicalModelUpdateObject};
