/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class VersionInfo {
    
    /**
    * @property {string} version
    */

    /**
    * @property {string} createdDateTime
    */

    /**
    * @property {string} lastModifiedDateTime
    */

    /**
    * @property {string} lastTrainedDateTime
    */

    /**
    * @property {string} lastPublishedDateTime
    */

    /**
    * @property {string} endpointUrl
    */

    /**
    * @property {undefined} assignedEndpointKey
    */

    /**
    * @property {undefined} externalApiKeys
    */

    /**
    * @property {integer} intentsCount
    */

    /**
    * @property {integer} entitiesCount
    */

    /**
    * @property {integer} endpointHitsCount
    */

    /**
    * @property {string} trainingStatus
    */

    
    constructor({version /* string */,createdDateTime /* string */,lastModifiedDateTime /* string */,lastTrainedDateTime /* string */,lastPublishedDateTime /* string */,endpointUrl /* string */,assignedEndpointKey /* undefined */,externalApiKeys /* undefined */,intentsCount /* integer */,entitiesCount /* integer */,endpointHitsCount /* integer */,trainingStatus /* string */} = {}) {
        Object.assign(this, {version /* string */,createdDateTime /* string */,lastModifiedDateTime /* string */,lastTrainedDateTime /* string */,lastPublishedDateTime /* string */,endpointUrl /* string */,assignedEndpointKey /* undefined */,externalApiKeys /* undefined */,intentsCount /* integer */,entitiesCount /* integer */,endpointHitsCount /* integer */,trainingStatus /* string */});
    }
}
VersionInfo.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(VersionInfo.fromJSON);
    }
    
    const {version /* string */,createdDateTime /* string */,lastModifiedDateTime /* string */,lastTrainedDateTime /* string */,lastPublishedDateTime /* string */,endpointUrl /* string */,assignedEndpointKey /* undefined */,externalApiKeys /* undefined */,intentsCount /* integer */,entitiesCount /* integer */,endpointHitsCount /* integer */,trainingStatus /* string */} = source;
    return new VersionInfo({version /* string */,createdDateTime /* string */,lastModifiedDateTime /* string */,lastTrainedDateTime /* string */,lastPublishedDateTime /* string */,endpointUrl /* string */,assignedEndpointKey /* undefined */,externalApiKeys /* undefined */,intentsCount /* integer */,entitiesCount /* integer */,endpointHitsCount /* integer */,trainingStatus /* string */});
};

module.exports = VersionInfo;
