"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const LuisClient = require("botframework-luis");
class LuisRecognizer extends botbuilder_1.Recognizer {
    constructor(appId, subscriptionKey) {
        super();
        if (typeof appId === 'string') {
            this.options = { appId: appId, subscriptionKey: subscriptionKey };
        }
        else {
            this.options = Object.assign({}, appId);
        }
        // We need to set verbose to true in order to get all intents
        if (this.options.options) {
            this.options.options.verbose = true;
        }
        else {
            this.options.options = { verbose: true };
        }
        // Create client and override callbacks
        let $this = this;
        const baseUri = (this.options.serviceEndpoint || 'https://westus.api.cognitive.microsoft.com');
        this.luisClient = new LuisClient(baseUri + '/luis/');
        this.onRecognize((context) => {
            const utterance = (context.request.text || '').trim();
            return $this.recognizeAndMap(utterance, true).then(res => {
                let recognizerResults = [res];
                return recognizerResults;
            });
        });
    }
    static recognize(utterance, options) {
        let recognizer = new LuisRecognizer(options);
        return recognizer.recognizeAndMap(utterance, true);
    }
    recognizeAndMap(utterance, verbose) {
        let $this = this;
        return this.luisClient.getIntentsAndEntitiesV2($this.options.appId, this.options.subscriptionKey, utterance, $this.options.options)
            .then((result) => {
            let entitiesAndMetadata = $this.getEntitiesAndMetadata(result.entities, result.compositeEntities, verbose);
            let recognizerResult = {
                text: result.query,
                intents: $this.getIntents(result.intents),
                entities: entitiesAndMetadata.entities
            };
            if (verbose) {
                recognizerResult.$instance = {
                    entities: entitiesAndMetadata.metadata
                };
            }
            return recognizerResult;
        });
    }
    getIntents(intents) {
        if (intents) {
            return intents.reduce((prev, curr) => {
                prev[curr.intent || ''] = curr.score;
                return prev;
            }, {});
        }
    }
    getEntitiesAndMetadata(entities, compositeEntities, verbose) {
        let $this = this;
        let entitiesAndMetadata = {
            entities: {},
            metadata: {}
        };
        let compositeEntityTypes = [];
        // We start by populating composite entities so that entities covered by them are removed from the entities list
        if (compositeEntities) {
            compositeEntityTypes = compositeEntities.map(compositeEntity => compositeEntity.parentType);
            compositeEntities.forEach(compositeEntity => {
                entities = $this.populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
            });
        }
        entities.forEach(entity => {
            // we'll address composite entities separately
            if (compositeEntityTypes.indexOf(entity.type) > -1)
                return;
            this.addProperty(entitiesAndMetadata.entities, entity.type, $this.getEntityValue(entity));
            if (verbose) {
                this.addProperty(entitiesAndMetadata.metadata, entity.type, $this.getEntityMetadata(entity));
            }
        });
        return entitiesAndMetadata;
    }
    getEntityValue(entity) {
        if (entity.type.startsWith("builtin.datetimeV2.")) {
            return entity.resolution && entity.resolution.values && entity.resolution.values.length ?
                entity.resolution.values[0].timex :
                entity.resolution;
        }
        else if (entity.resolution) {
            if (entity.type.startsWith("builtin.number")) {
                return Number(entity.resolution.value);
            }
            else {
                return Object.keys(entity.resolution).length > 1 ?
                    entity.resolution :
                    entity.resolution.value ?
                        entity.resolution.value :
                        entity.resolution.values;
            }
        }
        else {
            return entity.entity;
        }
    }
    getEntityMetadata(entity) {
        return {
            $startIndex: entity.startIndex,
            $endIndex: entity.endIndex,
            $entity: entity.entity,
            $score: entity.score,
            $resolution: entity.resolution ?
                entity.resolution.value ? [entity.resolution.value] : entity.resolution.values :
                undefined
        };
    }
    populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose) {
        let childrenEntites = {};
        let childrenEntitiesMetadata = {};
        let $this = this;
        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        let compositeEntityMetadata = entities.find(entity => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text 
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value;
        });
        // This is an error case and should not happen in theory
        if (!compositeEntityMetadata)
            return entities;
        let filteredEntities = [];
        if (verbose)
            childrenEntitiesMetadata = $this.getEntityMetadata(compositeEntityMetadata);
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
                    $this.addProperty(childrenEntites, entity.type, $this.getEntityValue(entity));
                    if (verbose)
                        $this.addProperty(childrenEntitiesMetadata, entity.type, $this.getEntityMetadata(entity));
                }
            }
            ;
        });
        // filter entities that were covered by this composite entity
        for (let i = 0; i < entities.length; i++) {
            if (!coveredSet.has(i))
                filteredEntities.push(entities[i]);
        }
        this.addProperty(entitiesAndMetadata.entities, compositeEntity.parentType, childrenEntites);
        if (verbose) {
            $this.addProperty(entitiesAndMetadata.metadata, compositeEntity.parentType, childrenEntitiesMetadata);
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