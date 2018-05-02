

class IntentPrediction {
    
    /**
    * @property {string} name
    */

    /**
    * @property {number} score
    */

    
    constructor({name /* string */,score /* number */} = {}) {
        Object.assign(this, {name /* string */,score /* number */});
    }
}
IntentPrediction.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(IntentPrediction.fromJSON);
    }
    
    const {name /* string */,score /* number */} = source;
    return new IntentPrediction({name /* string */,score /* number */});
};

module.exports = IntentPrediction;
