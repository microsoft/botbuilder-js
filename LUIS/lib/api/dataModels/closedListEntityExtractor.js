
const SubClosedListResponse = require('./subClosedListResponse');

class ClosedListEntityExtractor {
    
    /**
    * @property {SubClosedListResponse[]} subLists
    */

    
    constructor({subLists /* SubClosedListResponse[] */} = {}) {
        Object.assign(this, {subLists /* SubClosedListResponse[] */});
    }
}
ClosedListEntityExtractor.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ClosedListEntityExtractor.fromJSON);
    }
    
    source.subLists = SubClosedListResponse.fromJSON(source.subLists) || undefined;

    const {subLists /* SubClosedListResponse[] */} = source;
    return new ClosedListEntityExtractor({subLists /* SubClosedListResponse[] */});
};

module.exports = ClosedListEntityExtractor;
