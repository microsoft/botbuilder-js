class EntityLabelObject {

    /**
     * @property {string} entityName
     */

    /**
     * @property {integer} startCharIndex
     */

    /**
     * @property {integer} endCharIndex
     */


    constructor({entityName /* string */, startCharIndex /* integer */, endCharIndex /* integer */} = {}) {
        Object.assign(this, {entityName /* string */, startCharIndex /* integer */, endCharIndex /* integer */});
    }
}

EntityLabelObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntityLabelObject.fromJSON);
    }

    const {entityName /* string */, startCharIndex /* integer */, endCharIndex /* integer */} = source;
    return new EntityLabelObject({entityName /* string */, startCharIndex /* integer */, endCharIndex /* integer */});
};

module.exports = EntityLabelObject;
