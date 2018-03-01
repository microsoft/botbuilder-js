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
     * @property {string[]} bingEntities
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
     * @property {JSONRegexFeature[]} regexFeatures
     */

    /**
     * @property {JSONModelFeature[]} modelFeatures
     */

    /**
     * @property {JSONUtterance[]} utterances
     */


    constructor({name /* string */, versionId /* string */, desc /* string */, culture /* string */, intents /* HierarchicalModel[] */, entities /* HierarchicalModel[] */, bingEntities /* string[] */, actions /* JSONAction[] */, closedLists /* JSONClosedList[] */, composites /* HierarchicalModel[] */, regexFeatures /* JSONRegexFeature[] */, modelFeatures /* JSONModelFeature[] */, utterances /* JSONUtterance[] */} = {}) {
        Object.assign(this, {
            name /* string */,
            versionId /* string */,
            desc /* string */,
            culture /* string */,
            intents /* HierarchicalModel[] */,
            entities /* HierarchicalModel[] */,
            bingEntities /* string[] */,
            actions /* JSONAction[] */,
            closedLists /* JSONClosedList[] */,
            composites /* HierarchicalModel[] */,
            regexFeatures /* JSONRegexFeature[] */,
            modelFeatures /* JSONModelFeature[] */,
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

    source.regexFeatures = JSONRegexFeature.fromJSON(source.regexFeatures) || undefined;

    source.modelFeatures = JSONModelFeature.fromJSON(source.modelFeatures) || undefined;

    source.utterances = JSONUtterance.fromJSON(source.utterances) || undefined;

    const {name /* string */, versionId /* string */, desc /* string */, culture /* string */, intents /* HierarchicalModel[] */, entities /* HierarchicalModel[] */, bingEntities /* string[] */, actions /* JSONAction[] */, closedLists /* JSONClosedList[] */, composites /* HierarchicalModel[] */, regexFeatures /* JSONRegexFeature[] */, modelFeatures /* JSONModelFeature[] */, utterances /* JSONUtterance[] */} = source;
    return new JSONApp({
        name /* string */,
        versionId /* string */,
        desc /* string */,
        culture /* string */,
        intents /* HierarchicalModel[] */,
        entities /* HierarchicalModel[] */,
        bingEntities /* string[] */,
        actions /* JSONAction[] */,
        closedLists /* JSONClosedList[] */,
        composites /* HierarchicalModel[] */,
        regexFeatures /* JSONRegexFeature[] */,
        modelFeatures /* JSONModelFeature[] */,
        utterances /* JSONUtterance[] */
    });
};

module.exports = {JSONApp};
