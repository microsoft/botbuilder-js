const EntityLabelObject = require('./entityLabelObject');

class ExampleLabelObject {

    /**
     * @property {string} text
     */

    /**
     * @property {EntityLabelObject[]} entityLabels
     */

    /**
     * @property {string} intentName
     */


    constructor({text /* string */, entityLabels /* EntityLabelObject[] */, intentName /* string */} = {}) {
        Object.assign(this, {text /* string */, entityLabels /* EntityLabelObject[] */, intentName /* string */});
    }
}

ExampleLabelObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ExampleLabelObject.fromJSON);
    }

    source.entityLabels = EntityLabelObject.fromJSON(source.entityLabels) || undefined;

    const {text /* string */, entityLabels /* EntityLabelObject[] */, intentName /* string */} = source;
    return new ExampleLabelObject({text /* string */, entityLabels /* EntityLabelObject[] */, intentName /* string */});
};

module.exports = {ExampleLabelObject};
