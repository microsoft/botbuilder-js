/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class AvailablePrebuiltEntityModel {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string} description
    */

    /**
    * @property {string} examples
    */

    
    constructor({name /* string */,description /* string */,examples /* string */} = {}) {
        Object.assign(this, {name /* string */,description /* string */,examples /* string */});
    }
}
AvailablePrebuiltEntityModel.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(AvailablePrebuiltEntityModel.fromJSON);
    }
    
    const {name /* string */,description /* string */,examples /* string */} = source;
    return new AvailablePrebuiltEntityModel({name /* string */,description /* string */,examples /* string */});
};

module.exports = AvailablePrebuiltEntityModel;
