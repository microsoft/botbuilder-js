/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class CompositeEntityModel {
    
    /**
    * @property {string[]} children
    */

    /**
    * @property {string} name
    */

    
    constructor({children /* string[] */,name /* string */} = {}) {
        Object.assign(this, {children /* string[] */,name /* string */});
    }
}
CompositeEntityModel.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(CompositeEntityModel.fromJSON);
    }
    
    const {children /* string[] */,name /* string */} = source;
    return new CompositeEntityModel({children /* string[] */,name /* string */});
};

module.exports = CompositeEntityModel;
