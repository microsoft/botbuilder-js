class HierarchicalModelCreateObject {

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

HierarchicalModelCreateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(HierarchicalModelCreateObject.fromJSON);
    }

    const {children /* string[] */, name /* string */} = source;
    return new HierarchicalModelCreateObject({children /* string[] */, name /* string */});
};

module.exports = {HierarchicalModelCreateObject};
