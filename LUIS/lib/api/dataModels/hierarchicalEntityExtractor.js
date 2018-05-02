/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const ChildEntity = require('./childEntity');

class HierarchicalEntityExtractor {
    
    /**
    * @property {ChildEntity[]} children
    */

    
    constructor({children /* ChildEntity[] */} = {}) {
        Object.assign(this, {children /* ChildEntity[] */});
    }
}
HierarchicalEntityExtractor.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(HierarchicalEntityExtractor.fromJSON);
    }
    
    source.children = ChildEntity.fromJSON(source.children) || undefined;

    const {children /* ChildEntity[] */} = source;
    return new HierarchicalEntityExtractor({children /* ChildEntity[] */});
};

module.exports = HierarchicalEntityExtractor;
