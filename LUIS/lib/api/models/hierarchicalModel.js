class HierarchicalModel {

    /**
     * @property {string} name
     */

    /**
     * @property {string[]} children
     */


    constructor({name /* string */, children /* string[] */} = {}) {
        Object.assign(this, {name /* string */, children /* string[] */});
    }
}

HierarchicalModel.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(HierarchicalModel.fromJSON);
    }

    const {name /* string */, children /* string[] */} = source;
    return new HierarchicalModel({name /* string */, children /* string[] */});
};

module.exports = {HierarchicalModel};
