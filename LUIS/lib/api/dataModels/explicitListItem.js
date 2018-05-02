

class ExplicitListItem {
    
    /**
    * @property {integer} id
    */

    /**
    * @property {string} explicitListItem
    */

    
    constructor({id /* integer */,explicitListItem /* string */} = {}) {
        Object.assign(this, {id /* integer */,explicitListItem /* string */});
    }
}
ExplicitListItem.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ExplicitListItem.fromJSON);
    }
    
    const {id /* integer */,explicitListItem /* string */} = source;
    return new ExplicitListItem({id /* integer */,explicitListItem /* string */});
};

module.exports = ExplicitListItem;
