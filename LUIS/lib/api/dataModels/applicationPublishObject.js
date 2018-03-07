class ApplicationPublishObject {

    /**
     * @property {string} versionId
     */

    /**
     * @property {boolean} isStaging
     */


    constructor({versionId /* string */, isStaging /* boolean */} = {}) {
        Object.assign(this, {versionId /* string */, isStaging /* boolean */});
    }
}

ApplicationPublishObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationPublishObject.fromJSON);
    }

    const {versionId /* string */, isStaging /* boolean */} = source;
    return new ApplicationPublishObject({versionId /* string */, isStaging /* boolean */});
};

module.exports = ApplicationPublishObject;
