/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const PrebuiltDomainItem = require('./prebuiltDomainItem');

class PrebuiltDomain {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string} culture
    */

    /**
    * @property {string} description
    */

    /**
    * @property {string} examples
    */

    /**
    * @property {PrebuiltDomainItem[]} intents
    */

    /**
    * @property {PrebuiltDomainItem[]} entities
    */

    
    constructor({name /* string */,culture /* string */,description /* string */,examples /* string */,intents /* PrebuiltDomainItem[] */,entities /* PrebuiltDomainItem[] */} = {}) {
        Object.assign(this, {name /* string */,culture /* string */,description /* string */,examples /* string */,intents /* PrebuiltDomainItem[] */,entities /* PrebuiltDomainItem[] */});
    }
}
PrebuiltDomain.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(PrebuiltDomain.fromJSON);
    }
    
    source.intents = PrebuiltDomainItem.fromJSON(source.intents) || undefined;

    const {name /* string */,culture /* string */,description /* string */,examples /* string */,intents /* PrebuiltDomainItem[] */,entities /* PrebuiltDomainItem[] */} = source;
    return new PrebuiltDomain({name /* string */,culture /* string */,description /* string */,examples /* string */,intents /* PrebuiltDomainItem[] */,entities /* PrebuiltDomainItem[] */});
};

module.exports = PrebuiltDomain;
