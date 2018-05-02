

class ApplicationInfoResponse {
    
    /**
    * @property {string} id
    */

    /**
    * @property {string} name
    */

    /**
    * @property {string} description
    */

    /**
    * @property {string} culture
    */

    /**
    * @property {string} usageScenario
    */

    /**
    * @property {string} domain
    */

    /**
    * @property {integer} versionsCount
    */

    /**
    * @property {string} createdDateTime
    */

    /**
    * @property {undefined} endpoints
    */

    /**
    * @property {integer} endpointHitsCount
    */

    /**
    * @property {string} activeVersion
    */

    
    constructor({id /* string */,name /* string */,description /* string */,culture /* string */,usageScenario /* string */,domain /* string */,versionsCount /* integer */,createdDateTime /* string */,endpoints /* undefined */,endpointHitsCount /* integer */,activeVersion /* string */} = {}) {
        Object.assign(this, {id /* string */,name /* string */,description /* string */,culture /* string */,usageScenario /* string */,domain /* string */,versionsCount /* integer */,createdDateTime /* string */,endpoints /* undefined */,endpointHitsCount /* integer */,activeVersion /* string */});
    }
}
ApplicationInfoResponse.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationInfoResponse.fromJSON);
    }
    
    const {id /* string */,name /* string */,description /* string */,culture /* string */,usageScenario /* string */,domain /* string */,versionsCount /* integer */,createdDateTime /* string */,endpoints /* undefined */,endpointHitsCount /* integer */,activeVersion /* string */} = source;
    return new ApplicationInfoResponse({id /* string */,name /* string */,description /* string */,culture /* string */,usageScenario /* string */,domain /* string */,versionsCount /* integer */,createdDateTime /* string */,endpoints /* undefined */,endpointHitsCount /* integer */,activeVersion /* string */});
};

module.exports = ApplicationInfoResponse;
