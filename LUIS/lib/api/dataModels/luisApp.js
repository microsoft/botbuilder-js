/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const HierarchicalModel = require('./hierarchicalModel');
const ClosedList = require('./closedList');
const PatternAny = require('./patternAny');
const RegexEntity = require('./regexEntity');
const PrebuiltEntity = require('./prebuiltEntity');
const JSONRegexFeature = require('./jsonRegexFeature');
const JSONModelFeature = require('./jsonModelFeature');
const Pattern = require('./pattern');
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
    * @property {ClosedList[]} closedLists
    */

    /**
    * @property {HierarchicalModel[]} composites
    */

    /**
    * @property {PatternAny[]} patternAnyEntities
    */

    /**
    * @property {RegexEntity[]} regex_entities
    */

    /**
    * @property {PrebuiltEntity[]} prebuiltEntities
    */

    /**
    * @property {JSONRegexFeature[]} regex_features
    */

    /**
    * @property {JSONModelFeature[]} model_features
    */

    /**
    * @property {Pattern[]} patterns
    */

    /**
    * @property {JSONUtterance[]} utterances
    */

    
    constructor({name /* string */,versionId /* string */,desc /* string */,culture /* string */,intents /* HierarchicalModel[] */,entities /* HierarchicalModel[] */,closedLists /* ClosedList[] */,composites /* HierarchicalModel[] */,patternAnyEntities /* PatternAny[] */,regex_entities /* RegexEntity[] */,prebuiltEntities /* PrebuiltEntity[] */,regex_features /* JSONRegexFeature[] */,model_features /* JSONModelFeature[] */,patterns /* Pattern[] */,utterances /* JSONUtterance[] */} = {}) {
        Object.assign(this, {name /* string */,versionId /* string */,desc /* string */,culture /* string */,intents /* HierarchicalModel[] */,entities /* HierarchicalModel[] */,closedLists /* ClosedList[] */,composites /* HierarchicalModel[] */,patternAnyEntities /* PatternAny[] */,regex_entities /* RegexEntity[] */,prebuiltEntities /* PrebuiltEntity[] */,regex_features /* JSONRegexFeature[] */,model_features /* JSONModelFeature[] */,patterns /* Pattern[] */,utterances /* JSONUtterance[] */});
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

    source.patternAnyEntities = PatternAny.fromJSON(source.patternAnyEntities) || undefined;

    source.regex_entities = RegexEntity.fromJSON(source.regex_entities) || undefined;

    source.prebuiltEntities = PrebuiltEntity.fromJSON(source.prebuiltEntities) || undefined;

    source.regex_features = JSONRegexFeature.fromJSON(source.regex_features) || undefined;

    source.model_features = JSONModelFeature.fromJSON(source.model_features) || undefined;

    source.patterns = Pattern.fromJSON(source.patterns) || undefined;

    source.utterances = JSONUtterance.fromJSON(source.utterances) || undefined;

    const {name /* string */,versionId /* string */,desc /* string */,culture /* string */,intents /* HierarchicalModel[] */,entities /* HierarchicalModel[] */,closedLists /* ClosedList[] */,composites /* HierarchicalModel[] */,patternAnyEntities /* PatternAny[] */,regex_entities /* RegexEntity[] */,prebuiltEntities /* PrebuiltEntity[] */,regex_features /* JSONRegexFeature[] */,model_features /* JSONModelFeature[] */,patterns /* Pattern[] */,utterances /* JSONUtterance[] */} = source;
    return new LuisApp({name /* string */,versionId /* string */,desc /* string */,culture /* string */,intents /* HierarchicalModel[] */,entities /* HierarchicalModel[] */,closedLists /* ClosedList[] */,composites /* HierarchicalModel[] */,patternAnyEntities /* PatternAny[] */,regex_entities /* RegexEntity[] */,prebuiltEntities /* PrebuiltEntity[] */,regex_features /* JSONRegexFeature[] */,model_features /* JSONModelFeature[] */,patterns /* Pattern[] */,utterances /* JSONUtterance[] */});
};

module.exports = LuisApp;
