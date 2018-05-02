/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const EntityLabel = require('./entityLabel');
const IntentPrediction = require('./intentPrediction');
const EntityPrediction = require('./entityPrediction');

class LabeledUtterance {
    
    /**
    * @property {integer} id
    */

    /**
    * @property {string} text
    */

    /**
    * @property {string[]} tokenizedText
    */

    /**
    * @property {string} intentLabel
    */

    /**
    * @property {EntityLabel[]} entityLabels
    */

    /**
    * @property {IntentPrediction[]} intentPredictions
    */

    /**
    * @property {EntityPrediction[]} entityPredictions
    */

    
    constructor({id /* integer */,text /* string */,tokenizedText /* string[] */,intentLabel /* string */,entityLabels /* EntityLabel[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */} = {}) {
        Object.assign(this, {id /* integer */,text /* string */,tokenizedText /* string[] */,intentLabel /* string */,entityLabels /* EntityLabel[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */});
    }
}
LabeledUtterance.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(LabeledUtterance.fromJSON);
    }
    
    source.entityLabels = EntityLabel.fromJSON(source.entityLabels) || undefined;

    source.intentPredictions = IntentPrediction.fromJSON(source.intentPredictions) || undefined;

    source.entityPredictions = EntityPrediction.fromJSON(source.entityPredictions) || undefined;

    const {id /* integer */,text /* string */,tokenizedText /* string[] */,intentLabel /* string */,entityLabels /* EntityLabel[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */} = source;
    return new LabeledUtterance({id /* integer */,text /* string */,tokenizedText /* string[] */,intentLabel /* string */,entityLabels /* EntityLabel[] */,intentPredictions /* IntentPrediction[] */,entityPredictions /* EntityPrediction[] */});
};

module.exports = LabeledUtterance;
