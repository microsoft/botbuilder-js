/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class EndpointInfo {
    
    /**
    * @property {string} versionId
    */

    /**
    * @property {boolean} isStaging
    */

    /**
    * @property {string} endpointUrl
    */

    /**
    * @property {string} region
    */

    /**
    * @property {string} assignedEndpointKey
    */

    /**
    * @property {string} endpointRegion
    */

    /**
    * @property {string} publishedDateTime
    */

    
    constructor({versionId /* string */,isStaging /* boolean */,endpointUrl /* string */,region /* string */,assignedEndpointKey /* string */,endpointRegion /* string */,publishedDateTime /* string */} = {}) {
        Object.assign(this, {versionId /* string */,isStaging /* boolean */,endpointUrl /* string */,region /* string */,assignedEndpointKey /* string */,endpointRegion /* string */,publishedDateTime /* string */});
    }
}
EndpointInfo.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EndpointInfo.fromJSON);
    }
    
    const {versionId /* string */,isStaging /* boolean */,endpointUrl /* string */,region /* string */,assignedEndpointKey /* string */,endpointRegion /* string */,publishedDateTime /* string */} = source;
    return new EndpointInfo({versionId /* string */,isStaging /* boolean */,endpointUrl /* string */,region /* string */,assignedEndpointKey /* string */,endpointRegion /* string */,publishedDateTime /* string */});
};

module.exports = EndpointInfo;
