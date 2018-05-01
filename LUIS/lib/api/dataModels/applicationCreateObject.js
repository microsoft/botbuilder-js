

class ApplicationCreateObject {
    
    /**
    * @property {string} culture
    */

    /**
    * @property {string} domain
    */

    /**
    * @property {string} description
    */

    /**
    * @property {string} initialVersionId
    */

    /**
    * @property {string} usageScenario
    */

    /**
    * @property {string} name
    */

    
    constructor({culture /* string */,domain /* string */,description /* string */,initialVersionId /* string */,usageScenario /* string */,name /* string */} = {}) {
        Object.assign(this, {culture /* string */,domain /* string */,description /* string */,initialVersionId /* string */,usageScenario /* string */,name /* string */});
    }
}
ApplicationCreateObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationCreateObject.fromJSON);
    }
    
    const {culture /* string */,domain /* string */,description /* string */,initialVersionId /* string */,usageScenario /* string */,name /* string */} = source;
    return new ApplicationCreateObject({culture /* string */,domain /* string */,description /* string */,initialVersionId /* string */,usageScenario /* string */,name /* string */});
};

module.exports = ApplicationCreateObject;
