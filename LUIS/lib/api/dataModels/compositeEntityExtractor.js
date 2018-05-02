/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const ChildEntity = require('./childEntity');

class CompositeEntityExtractor {
    
    /**
    * @property {ChildEntity[]} children
    */

    
    constructor({children /* ChildEntity[] */} = {}) {
        Object.assign(this, {children /* ChildEntity[] */});
    }
}
CompositeEntityExtractor.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(CompositeEntityExtractor.fromJSON);
    }
    
    source.children = ChildEntity.fromJSON(source.children) || undefined;

    const {children /* ChildEntity[] */} = source;
    return new CompositeEntityExtractor({children /* ChildEntity[] */});
};

module.exports = CompositeEntityExtractor;
