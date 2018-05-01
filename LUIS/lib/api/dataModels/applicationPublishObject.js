

class ApplicationPublishObject {
    
    /**
    * @property {string} versionId
    */

    /**
    * @property {boolean} isStaging
    */

    /**
    * @property {string} region
    */

    
    constructor({versionId /* string */,isStaging /* boolean */,region /* string */} = {}) {
        Object.assign(this, {versionId /* string */,isStaging /* boolean */,region /* string */});
    }
}
ApplicationPublishObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationPublishObject.fromJSON);
    }
    
    const {versionId /* string */,isStaging /* boolean */,region /* string */} = source;
    return new ApplicationPublishObject({versionId /* string */,isStaging /* boolean */,region /* string */});
};

module.exports = ApplicationPublishObject;
