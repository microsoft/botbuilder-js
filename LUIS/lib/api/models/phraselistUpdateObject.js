class PhraselistUpdateObject {

    /**
     * @property {string} phrases
     */

    /**
     * @property {string} name
     */

    /**
     * @property {boolean} isActive
     */

    /**
     * @property {boolean} isExchangeable
     */


    constructor({phrases /* string */, name /* string */, isActive /* boolean */, isExchangeable /* boolean */} = {}) {
        Object.assign(this, {
            phrases /* string */,
            name /* string */,
            isActive /* boolean */,
            isExchangeable /* boolean */
        });
    }
}

PhraselistUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PhraselistUpdateObject.fromJSON);
    }

    const {phrases /* string */, name /* string */, isActive /* boolean */, isExchangeable /* boolean */} = source;
    return new PhraselistUpdateObject({
        phrases /* string */,
        name /* string */,
        isActive /* boolean */,
        isExchangeable /* boolean */
    });
};

module.exports = {PhraselistUpdateObject};
