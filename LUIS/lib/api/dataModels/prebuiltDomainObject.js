/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class PrebuiltDomainObject {
    
    /**
    * @property {string} domain_name
    */

    /**
    * @property {string} model_name
    */

    
    constructor({domain_name /* string */,model_name /* string */} = {}) {
        Object.assign(this, {domain_name /* string */,model_name /* string */});
    }
}
PrebuiltDomainObject.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PrebuiltDomainObject.fromJSON);
    }
    
    const {domain_name /* string */,model_name /* string */} = source;
    return new PrebuiltDomainObject({domain_name /* string */,model_name /* string */});
};

module.exports = PrebuiltDomainObject;
