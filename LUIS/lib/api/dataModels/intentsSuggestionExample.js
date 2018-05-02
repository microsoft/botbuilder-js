
const IntentPrediction = require('./intentPrediction');
const EntityPrediction = require('./entityPrediction');

class IntentsSuggestionExample {
    
    /**
    * @property {string} text
    */

    /**
    * @property {string[]} tokenizedText
    */

    /**
    * @property {IntentPrediction[]} intentPredictions
    */

    /**
    * @property {EntityPrediction[]} entityPredictions
    */

    
    constructor({text /* string */,tokenizedText /* string[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */} = {}) {
        Object.assign(this, {text /* string */,tokenizedText /* string[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */});
    }
}
IntentsSuggestionExample.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(IntentsSuggestionExample.fromJSON);
    }
    
    source.intentPredictions = IntentPrediction.fromJSON(source.intentPredictions) || undefined;

    source.entityPredictions = EntityPrediction.fromJSON(source.entityPredictions) || undefined;

    const {text /* string */,tokenizedText /* string[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */} = source;
    return new IntentsSuggestionExample({text /* string */,tokenizedText /* string[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */});
};

module.exports = IntentsSuggestionExample;
