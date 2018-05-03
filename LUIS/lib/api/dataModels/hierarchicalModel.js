/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const PrebuiltDomainObject = require('./prebuiltDomainObject');
class HierarchicalModel {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string[]} children
    */

    /**
    * @property {PrebuiltDomainObject} inherits
    */

    /**
    * @property {string[]} roles
    */

    
    constructor({name /* string */,children /* string[] */,inherits /* PrebuiltDomainObject */,roles /* string[] */} = {}) {
        Object.assign(this, {name /* string */,children /* string[] */,inherits /* PrebuiltDomainObject */,roles /* string[] */});
    }
}
HierarchicalModel.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(HierarchicalModel.fromJSON);
    }
    
    source.inherits = PrebuiltDomainObject.fromJSON(source.inherits) || undefined;

    const {name /* string */,children /* string[] */,inherits /* PrebuiltDomainObject */,roles /* string[] */} = source;
    return new HierarchicalModel({name /* string */,children /* string[] */,inherits /* PrebuiltDomainObject */,roles /* string[] */});
};

module.exports = HierarchicalModel;
