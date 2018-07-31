"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LuisClient = require("botframework-luis");
const LUIS_TRACE_TYPE = 'https://www.luis.ai/schemas/trace';
const LUIS_TRACE_NAME = 'LuisRecognizer';
const LUIS_TRACE_LABEL = 'Luis Trace';
/**
 * Component used to recognize intents in a user utterance using a configured LUIS model.
 *
 * @remarks
 * This component can be used within your bots logic by calling [recognize()](#recognize).
 */
class LuisRecognizer {
    /**
     * Creates a new LuisRecognizer instance.
     * @param settings Settings used to configure the instance.
     */
    constructor(settings) {
        this.cacheKey = Symbol('results');
        this.settings = Object.assign({}, settings);
        // Create client and override callbacks
        const baseUri = (this.settings.serviceEndpoint || 'https://westus.api.cognitive.microsoft.com');
        this.luisClient = this.createClient(baseUri + '/luis/');
    }
    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     *
     * @remarks
     * In addition to returning the results from LUIS, [recognize()](#recognize) will also
     * emit a trace activity that contains the LUIS results.
     * @param context Context for the current turn of conversation with the use.
     */
    recognize(context) {
        const cached = context.services.get(this.cacheKey);
        if (!cached) {
            const utterance = context.activity.text || '';
            return this.luisClient.getIntentsAndEntitiesV2(this.settings.appId, this.settings.subscriptionKey, utterance, this.settings.options)
                .then((luisResult) => {
                // Map results
                const recognizerResult = {
                    text: luisResult.query,
                    alteredText: luisResult.alteredQuery,
                    intents: this.getIntents(luisResult),
                    entities: this.getEntitiesAndMetadata(luisResult.entities, luisResult.compositeEntities, this.settings.verbose),
                    luisResult: luisResult
                };
                // Write to cache
                context.services.set(this.cacheKey, recognizerResult);
                return this.emitTraceInfo(context, luisResult, recognizerResult).then(() => {
                    return recognizerResult;
                });
            });
        }
        return Promise.resolve(cached);
    }
    /**
     * Called internally to create a LuisClient instance.
     *
     * @remarks
     * This is exposed to enable better unit testing of the recognizer.
     * @param baseUri Service endpoint being called.
     */
    createClient(baseUri) {
        return new LuisClient(baseUri);
    }
    /**
     * Returns the name of the top scoring intent from a set of LUIS results.
     * @param results Result set to be searched.
     * @param defaultIntent (Optional) intent name to return should a top intent be found. Defaults to a value of `None`.
     * @param minScore (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned.  Defaults to a value of `0.0`.
     */
    static topIntent(results, defaultIntent = 'None', minScore = 0.0) {
        let topIntent = undefined;
        let topScore = -1;
        if (results && results.intents) {
            for (const name in results.intents) {
                const score = results.intents[name].score;
                if (typeof score === 'number' && score > topScore && score >= minScore) {
                    topIntent = name;
                    topScore = score;
                }
            }
        }
        return topIntent || defaultIntent;
    }
    emitTraceInfo(context, luisResult, recognizerResult) {
        const traceInfo = {
            recognizerResult: recognizerResult,
            luisResult: luisResult,
            luisOptions: {
                Staging: this.settings.options && this.settings.options.staging
            },
            luisModel: {
                ModelID: this.settings.appId
            }
        };
        return context.sendActivity({
            type: 'trace',
            valueType: LUIS_TRACE_TYPE,
            name: LUIS_TRACE_NAME,
            label: LUIS_TRACE_LABEL,
            value: traceInfo
        });
    }
    normalizeName(name) {
        return name.replace(/\.| /g, '_');
    }
    getIntents(luisResult) {
        const intents = {};
        if (luisResult.intents) {
            luisResult.intents.reduce((prev, curr) => {
                prev[this.normalizeName(curr.intent)] = { score: curr.score };
                return prev;
            }, intents);
        }
        else {
            const topScoringIntent = luisResult.topScoringIntent;
            intents[this.normalizeName((topScoringIntent).intent)] = { score: topScoringIntent.score };
        }
        return intents;
    }
    getEntitiesAndMetadata(entities, compositeEntities, verbose) {
        let entitiesAndMetadata = verbose ? { $instance: {} } : {};
        let compositeEntityTypes = [];
        // We start by populating composite entities so that entities covered by them are removed from the entities list
        if (compositeEntities) {
            compositeEntityTypes = compositeEntities.map(compositeEntity => compositeEntity.parentType);
            compositeEntities.forEach(compositeEntity => {
                entities = this.populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
            });
        }
        entities.forEach(entity => {
            // we'll address composite entities separately
            if (compositeEntityTypes.indexOf(entity.type) > -1) {
                return;
            }
            this.addProperty(entitiesAndMetadata, this.getNormalizedEntityName(entity), this.getEntityValue(entity));
            if (verbose) {
                this.addProperty(entitiesAndMetadata.$instance, this.getNormalizedEntityName(entity), this.getEntityMetadata(entity));
            }
        });
        return entitiesAndMetadata;
    }
    getEntityValue(entity) {
        if (!entity.resolution) {
            return entity.entity;
        }
        if (entity.type.startsWith('builtin.datetimeV2.')) {
            if (!entity.resolution.values || !entity.resolution.values.length) {
                return entity.resolution;
            }
            var vals = entity.resolution.values;
            var type = vals[0].type;
            var timexes = vals.map(t => t.timex);
            var distinct = timexes.filter((v, i, a) => a.indexOf(v) === i);
            return { type: type, timex: distinct };
        }
        else {
            var res = entity.resolution;
            switch (entity.type) {
                case "builtin.number":
                case "builtin.ordinal": return Number(res.value);
                case "builtin.percentage":
                    {
                        var svalue = res.value;
                        if (svalue.endsWith("%")) {
                            svalue = svalue.substring(0, svalue.length - 1);
                        }
                        return Number(svalue);
                    }
                case "builtin.age":
                case "builtin.dimension":
                case "builtin.currency":
                case "builtin.temperature":
                    {
                        var val = res.value;
                        var obj = {};
                        if (val) {
                            obj["number"] = Number(val);
                        }
                        obj["units"] = res.unit;
                        return obj;
                    }
                default:
                    return Object.keys(entity.resolution).length > 1 ?
                        entity.resolution :
                        entity.resolution.value ?
                            entity.resolution.value :
                            entity.resolution.values;
            }
        }
    }
    getEntityMetadata(entity) {
        return {
            startIndex: entity.startIndex,
            endIndex: entity.endIndex + 1,
            text: entity.entity,
            score: entity.score
        };
    }
    getNormalizedEntityName(entity) {
        // Type::Role -> Role
        var type = entity.type.split(':').pop();
        if (type.startsWith("builtin.datetimeV2.")) {
            type = "datetime";
        }
        if (type.startsWith("builtin.currency")) {
            type = "money";
        }
        if (type.startsWith('builtin.')) {
            type = type.substring(8);
        }
        if (entity.role != null && entity.role != "") {
            type = entity.role;
        }
        return type.replace(/\.|\s/g, "_");
    }
    populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose) {
        let childrenEntites = verbose ? { $instance: {} } : {};
        let childrenEntitiesMetadata = {};
        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        let compositeEntityMetadata = entities.find(entity => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text 
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value;
        });
        let filteredEntities = [];
        if (verbose) {
            childrenEntitiesMetadata = this.getEntityMetadata(compositeEntityMetadata);
        }
        // This is now implemented as O(n*k) search and can be reduced to O(n + k) using a map as an optimization if n or k grow
        let coveredSet = new Set();
        compositeEntity.children.forEach(childEntity => {
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                if (!coveredSet.has(i) &&
                    childEntity.type === entity.type &&
                    compositeEntityMetadata &&
                    entity.startIndex != undefined && compositeEntityMetadata.startIndex != undefined && entity.startIndex >= compositeEntityMetadata.startIndex &&
                    entity.endIndex != undefined && compositeEntityMetadata.endIndex != undefined && entity.endIndex <= compositeEntityMetadata.endIndex) {
                    // Add to the set to ensure that we don't consider the same child entity more than once per composite
                    coveredSet.add(i);
                    this.addProperty(childrenEntites, this.getNormalizedEntityName(entity), this.getEntityValue(entity));
                    if (verbose)
                        this.addProperty(childrenEntites.$instance, this.getNormalizedEntityName(entity), this.getEntityMetadata(entity));
                }
            }
            ;
        });
        // filter entities that were covered by this composite entity
        for (let i = 0; i < entities.length; i++) {
            if (!coveredSet.has(i))
                filteredEntities.push(entities[i]);
        }
        this.addProperty(entitiesAndMetadata, compositeEntity.parentType, childrenEntites);
        if (verbose) {
            this.addProperty(entitiesAndMetadata.$instance, compositeEntity.parentType, childrenEntitiesMetadata);
        }
        return filteredEntities;
    }
    /**
     * If a property doesn't exist add it to a new array, otherwise append it to the existing array
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    addProperty(obj, key, value) {
        if (key in obj)
            obj[key] = obj[key].concat(value);
        else
            obj[key] = [value];
    }
}
exports.LuisRecognizer = LuisRecognizer;
//# sourceMappingURL=luisRecognizer.js.map