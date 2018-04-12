const HierarchicalModel = require('./hierarchicalModel');
const JSONAction = require('./jsonAction');
const JSONClosedList = require('./jsonClosedList');
const JSONRegexFeature = require('./jsonRegexFeature');
const JSONModelFeature = require('./jsonModelFeature');
const JSONUtterance = require('./jsonUtterance');

class JSONApp {

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
     * @property {string[]} bing_entities
     */

    /**
     * @property {JSONAction[]} actions
     */

    /**
     * @property {JSONClosedList[]} closedLists
     */

    /**
     * @property {HierarchicalModel[]} composites
     */

    /**
     * @property {JSONRegexFeature[]} regex_features
     */

    /**
     * @property {JSONModelFeature[]} model_features
     */

    /**
     * @property {JSONUtterance[]} utterances
     */


    constructor({name /* string */, versionId /* string */, desc /* string */, culture /* string */, intents /* HierarchicalModel[] */, entities /* HierarchicalModel[] */, bing_entities /* string[] */, actions /* JSONAction[] */, closedLists /* JSONClosedList[] */, composites /* HierarchicalModel[] */, regex_features /* JSONRegexFeature[] */, model_features /* JSONModelFeature[] */, utterances /* JSONUtterance[] */} = {}) {
        Object.assign(this, {
            name /* string */,
            versionId /* string */,
            desc /* string */,
            culture /* string */,
            intents /* HierarchicalModel[] */,
            entities /* HierarchicalModel[] */,
            bing_entities /* string[] */,
            actions /* JSONAction[] */,
            closedLists /* JSONClosedList[] */,
            composites /* HierarchicalModel[] */,
            regex_features /* JSONRegexFeature[] */,
            model_features /* JSONModelFeature[] */,
            utterances /* JSONUtterance[] */
        });
    }
}

JSONApp.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONApp.fromJSON);
    }

    source.intents = HierarchicalModel.fromJSON(source.intents) || undefined;

    source.actions = JSONAction.fromJSON(source.actions) || undefined;

    source.closedLists = JSONClosedList.fromJSON(source.closedLists) || undefined;

    source.regex_features = JSONRegexFeature.fromJSON(source.regex_features) || undefined;

    source.model_features = JSONModelFeature.fromJSON(source.model_features) || undefined;

    source.utterances = JSONUtterance.fromJSON(source.utterances) || undefined;

    const {name /* string */, versionId /* string */, desc /* string */, culture /* string */, intents /* HierarchicalModel[] */, entities /* HierarchicalModel[] */, bing_entities /* string[] */, actions /* JSONAction[] */, closedLists /* JSONClosedList[] */, composites /* HierarchicalModel[] */, regex_features /* JSONRegexFeature[] */, model_features /* JSONModelFeature[] */, utterances /* JSONUtterance[] */} = source;
    return new JSONApp({
        name /* string */,
        versionId /* string */,
        desc /* string */,
        culture /* string */,
        intents /* HierarchicalModel[] */,
        entities /* HierarchicalModel[] */,
        bing_entities /* string[] */,
        actions /* JSONAction[] */,
        closedLists /* JSONClosedList[] */,
        composites /* HierarchicalModel[] */,
        regex_features /* JSONRegexFeature[] */,
        model_features /* JSONModelFeature[] */,
        utterances /* JSONUtterance[] */
        
    });
};

module.exports = JSONApp;
