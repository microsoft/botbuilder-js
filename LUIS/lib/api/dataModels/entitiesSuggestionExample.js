/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const IntentPrediction = require('./intentPrediction');
const EntityPrediction = require('./entityPrediction');

class EntitiesSuggestionExample {
    
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
EntitiesSuggestionExample.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EntitiesSuggestionExample.fromJSON);
    }
    
    source.intentPredictions = IntentPrediction.fromJSON(source.intentPredictions) || undefined;

    source.entityPredictions = EntityPrediction.fromJSON(source.entityPredictions) || undefined;

    const {text /* string */,tokenizedText /* string[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */} = source;
    return new EntitiesSuggestionExample({text /* string */,tokenizedText /* string[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */});
};

module.exports = EntitiesSuggestionExample;
