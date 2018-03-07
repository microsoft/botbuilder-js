class JSONActionParam {

    /**
     * @property {string} phraseListFeatureName
     */

    /**
     * @property {string} parameterName
     */

    /**
     * @property {string} entityName
     */

    /**
     * @property {boolean} required
     */

    /**
     * @property {string} question
     */


    constructor({phraseListFeatureName /* string */, parameterName /* string */, entityName /* string */, required /* boolean */, question /* string */} = {}) {
        Object.assign(this, {
            phraseListFeatureName /* string */,
            parameterName /* string */,
            entityName /* string */,
            required /* boolean */,
            question /* string */
        });
    }
}

JSONActionParam.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONActionParam.fromJSON);
    }

    const {phraseListFeatureName /* string */, parameterName /* string */, entityName /* string */, required /* boolean */, question /* string */} = source;
    return new JSONActionParam({
        phraseListFeatureName /* string */,
        parameterName /* string */,
        entityName /* string */,
        required /* boolean */,
        question /* string */
    });
};

module.exports = JSONActionParam;
