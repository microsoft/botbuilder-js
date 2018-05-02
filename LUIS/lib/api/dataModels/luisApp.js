/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const HierarchicalModel = require('./hierarchicalModel');
const ClosedList = require('./closedList');
const JSONRegexFeature = require('./jsonRegexFeature');
const JSONModelFeature = require('./jsonModelFeature');
const JSONUtterance = require('./jsonUtterance');

class LuisApp {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string} versionId
    */

    /**
    * @property {string} desc
    */

    /**
    * @property {string} culture
    */

    /**
    * @property {HierarchicalModel[]} intents
    */

    /**
    * @property {HierarchicalModel[]} entities
    */

    /**
    * @property {string[]} bingEntities
    */

    /**
    * @property {ClosedList[]} closedLists
    */

    /**
    * @property {HierarchicalModel[]} composites
    */

    /**
    * @property {JSONRegexFeature[]} regexFeatures
    */

    /**
    * @property {JSONModelFeature[]} modelFeatures
    */

    /**
    * @property {JSONUtterance[]} utterances
    */

    
    constructor({name /* string */,versionId /* string */,desc /* string */,culture /* string */,intents /* HierarchicalModel[] */,entities /* HierarchicalModel[] */,bingEntities /* string[] */,closedLists /* ClosedList[] */,composites /* HierarchicalModel[] */,regexFeatures /* JSONRegexFeature[] */,modelFeatures /* JSONModelFeature[] */,utterances /* JSONUtterance[] */} = {}) {
        Object.assign(this, {name /* string */,versionId /* string */,desc /* string */,culture /* string */,intents /* HierarchicalModel[] */,entities /* HierarchicalModel[] */,bingEntities /* string[] */,closedLists /* ClosedList[] */,composites /* HierarchicalModel[] */,regexFeatures /* JSONRegexFeature[] */,modelFeatures /* JSONModelFeature[] */,utterances /* JSONUtterance[] */});
    }
}
LuisApp.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(LuisApp.fromJSON);
    }
    
    source.intents = HierarchicalModel.fromJSON(source.intents) || undefined;

    source.closedLists = ClosedList.fromJSON(source.closedLists) || undefined;

    source.regexFeatures = JSONRegexFeature.fromJSON(source.regexFeatures) || undefined;

    source.modelFeatures = JSONModelFeature.fromJSON(source.modelFeatures) || undefined;

    source.utterances = JSONUtterance.fromJSON(source.utterances) || undefined;

    const {name /* string */,versionId /* string */,desc /* string */,culture /* string */,intents /* HierarchicalModel[] */,entities /* HierarchicalModel[] */,bingEntities /* string[] */,closedLists /* ClosedList[] */,composites /* HierarchicalModel[] */,regexFeatures /* JSONRegexFeature[] */,modelFeatures /* JSONModelFeature[] */,utterances /* JSONUtterance[] */} = source;
    return new LuisApp({name /* string */,versionId /* string */,desc /* string */,culture /* string */,intents /* HierarchicalModel[] */,entities /* HierarchicalModel[] */,bingEntities /* string[] */,closedLists /* ClosedList[] */,composites /* HierarchicalModel[] */,regexFeatures /* JSONRegexFeature[] */,modelFeatures /* JSONModelFeature[] */,utterances /* JSONUtterance[] */});
};

module.exports = LuisApp;
