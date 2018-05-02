/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PersonalAssistantsResponse {
    
    /**
    * @property {undefined} endpointKeys
    */

    /**
    * @property {undefined} endpointUrls
    */

    
    constructor({endpointKeys /* undefined */,endpointUrls /* undefined */} = {}) {
        Object.assign(this, {endpointKeys /* undefined */,endpointUrls /* undefined */});
    }
}
PersonalAssistantsResponse.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PersonalAssistantsResponse.fromJSON);
    }
    
    const {endpointKeys /* undefined */,endpointUrls /* undefined */} = source;
    return new PersonalAssistantsResponse({endpointKeys /* undefined */,endpointUrls /* undefined */});
};

module.exports = PersonalAssistantsResponse;
