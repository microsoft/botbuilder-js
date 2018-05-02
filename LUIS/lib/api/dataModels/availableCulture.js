

class AvailableCulture {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string} code
    */

    
    constructor({name /* string */,code /* string */} = {}) {
        Object.assign(this, {name /* string */,code /* string */});
    }
}
AvailableCulture.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(AvailableCulture.fromJSON);
    }
    
    const {name /* string */,code /* string */} = source;
    return new AvailableCulture({name /* string */,code /* string */});
};

module.exports = AvailableCulture;
