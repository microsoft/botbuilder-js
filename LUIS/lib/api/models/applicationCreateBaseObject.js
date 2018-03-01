class ApplicationCreateBaseObject {

    /**
     * @property {string} culture
     */

    /**
     * @property {string} usageScenario
     */

    /**
     * @property {string} description
     */

    /**
     * @property {string} domain
     */

    /**
     * @property {string} name
     */


    constructor({culture /* string */, usageScenario /* string */, description /* string */, domain /* string */, name /* string */} = {}) {
        Object.assign(this, {
            culture /* string */,
            usageScenario /* string */,
            description /* string */,
            domain /* string */,
            name /* string */
        });
    }
}

ApplicationCreateBaseObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationCreateBaseObject.fromJSON);
    }

    const {culture /* string */, usageScenario /* string */, description /* string */, domain /* string */, name /* string */} = source;
    return new ApplicationCreateBaseObject({
        culture /* string */,
        usageScenario /* string */,
        description /* string */,
        domain /* string */,
        name /* string */
    });
};

module.exports = {ApplicationCreateBaseObject};
