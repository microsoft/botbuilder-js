/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class EndpointKeysDTO {
    
    /**
    * @property {string} primaryEndpointKey
    */

    /**
    * @property {string} secondaryEndpointKey
    */

    
    constructor({primaryEndpointKey /* string */,secondaryEndpointKey /* string */} = {}) {
        Object.assign(this, {primaryEndpointKey /* string */,secondaryEndpointKey /* string */});
    }
}
EndpointKeysDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(EndpointKeysDTO.fromJSON);
    }
    
    const {primaryEndpointKey /* string */,secondaryEndpointKey /* string */} = src;
    return new EndpointKeysDTO({primaryEndpointKey /* string */,secondaryEndpointKey /* string */});
};

module.exports = EndpointKeysDTO;
