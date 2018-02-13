/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Recognizer, RecognizerResult } from 'botbuilder';
import LuisClient = require('botframework-luis');
import { LuisResult, Intent, Entity, CompositeEntity } from 'botframework-luis/lib/models';


export interface LuisRecognizerOptions {
    /** Your models AppId */
    appId: string;

    /** Your subscription key. */
    subscriptionKey: string;

    /** (Optional) service endpoint to call. Defaults to "https://westus.api.cognitive.microsoft.com". */
    serviceEndpoint?: string;

    /** (Optional) request options passed to service call.  */
    options?: { 
        timezoneOffset? : number; 
        contextId? : string; 
        verbose? : boolean; 
        forceSet? : string; 
        allowSampling?: string; 
        customHeaders?: { [headerName: string]: string; };
    };
}

export class LuisRecognizer extends Recognizer {
    private options: LuisRecognizerOptions
    private luisClient: LuisClient;

    constructor(options: LuisRecognizerOptions)
    constructor(appId: string, subscriptionKey: string)
    constructor(appId: string|LuisRecognizerOptions, subscriptionKey?: string) {
        super();
        if (typeof appId === 'string') {
            this.options = { appId: appId, subscriptionKey: subscriptionKey as string };
        } else {
            this.options = Object.assign({}, appId);
        }   

        // We need to set verbose to true in order to get all intents
        if(this.options.options) {
            this.options.options.verbose = true;
        }
        else {
            this.options.options = { verbose : true };
        }

        // Create client and override callbacks
        let $this = this;
        const baseUri = (this.options.serviceEndpoint || 'https://westus.api.cognitive.microsoft.com');
        this.luisClient = new LuisClient(baseUri + '/luis/');
        this.onRecognize((context) => {
            const utterance = (context.request.text || '').trim();
            return $this.recognizeAndMap( utterance,true).then(res =>{
                let recognizerResults : RecognizerResult[]  = [res]
                return recognizerResults;
            });
        });
    }

    public static recognize(utterance: string, options: LuisRecognizerOptions): Promise<RecognizerResult> {
        let recognizer = new LuisRecognizer(options);
        return recognizer.recognizeAndMap(utterance, true);
    }

    protected recognizeAndMap(utterance: string, verbose: boolean): Promise<RecognizerResult> {
        let $this = this;
        return this.luisClient.getIntentsAndEntitiesV2($this.options.appId, this.options.subscriptionKey, utterance, $this.options.options)
            .then((result : LuisResult) => {
                let entitiesAndMetadata = $this.getEntitiesAndMetadata(result.entities, result.compositeEntities, verbose);
                let recognizerResult  : RecognizerResult = {
                    text: result.query,
                    intents: $this.getIntents(result.intents),
                    entities: entitiesAndMetadata.entities
                };
                if(verbose) {
                    recognizerResult.$instance = {
                        entities : entitiesAndMetadata.metadata
                    };
                }
                
                return recognizerResult;
            });
    }

    private getIntents(intents: Intent[] | undefined) : object | undefined {
        if(intents){
            return intents.reduce((prev : any, curr : Intent) => {
                prev[curr.intent || ''] = curr.score;
                return prev;
            }, {});
        }
    }

    private getEntitiesAndMetadata(entities: Entity[], compositeEntities : CompositeEntity[] | undefined, verbose: boolean) : any {
        let $this = this;

        let entitiesAndMetadata : any = {
            entities : {},
            metadata : {}
        };

        let compositeEntityTypes : string[] = [];

        // We start by populating composite entities so that entities covered by them are removed from the entities list
        if(compositeEntities){
            compositeEntityTypes = compositeEntities.map(compositeEntity => compositeEntity.parentType);
            compositeEntities.forEach(compositeEntity => {
                entities = $this.populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
            });
        }

        entities.forEach(entity => {
            // we'll address composite entities separately
            if(compositeEntityTypes.indexOf(entity.type) > -1)
                return;

            this.addProperty(entitiesAndMetadata.entities, entity.type, $this.getEntityValue(entity));
            if(verbose){
                this.addProperty(entitiesAndMetadata.metadata, entity.type, $this.getEntityMetadata(entity));
            }
        });

        return entitiesAndMetadata;
    }

    private getEntityValue(entity: Entity) : any {
        if(entity.type.startsWith("builtin.datetimeV2.")){
            return entity.resolution && entity.resolution.values && entity.resolution.values.length ? 
                                entity.resolution.values[0].timex : 
                                entity.resolution;
           
        }
        else if(entity.resolution){
            if(entity.type.startsWith("builtin.number")){
                return Number(entity.resolution.value)
            }
            else
            {
                return Object.keys(entity.resolution).length > 1 ? 
                        entity.resolution : 
                        entity.resolution.value ? 
                            entity.resolution.value : 
                            entity.resolution.values;
            }
        }
        else{
            return entity.entity;
        }
    }

    private getEntityMetadata(entity: Entity) : any {
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

    private populateCompositeEntity(compositeEntity: CompositeEntity, entities: Entity[], entitiesAndMetadata : any, verbose: boolean) : Entity[] {
        let childrenEntites : any = {};
        let childrenEntitiesMetadata : any = {};
        let $this = this;
        
        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        let compositeEntityMetadata : Entity | undefined = entities.find(entity => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text 
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value
        });

        // This is an error case and should not happen in theory
        if(!compositeEntityMetadata)
            return entities;

        let filteredEntities : Entity[] = [];
        if(verbose)
            childrenEntitiesMetadata = $this.getEntityMetadata(compositeEntityMetadata);

        // This is now implemented as O(n*k) search and can be reduced to O(n + k) using a map as an optimization if n or k grow
        let coveredSet = new Set();
        compositeEntity.children.forEach(childEntity => {
            for(let i=0; i<entities.length; i++){
                let entity = entities[i];
                if(!coveredSet.has(i) &&
                    childEntity.type === entity.type && 
                    compositeEntityMetadata && 
                    entity.startIndex != undefined && compositeEntityMetadata.startIndex != undefined && entity.startIndex >= compositeEntityMetadata.startIndex && 
                    entity.endIndex != undefined && compositeEntityMetadata.endIndex != undefined && entity.endIndex <= compositeEntityMetadata.endIndex){

                    // Add to the set to ensure that we don't consider the same child entity more than once per composite
                    coveredSet.add(i);
                    $this.addProperty(childrenEntites, entity.type, $this.getEntityValue(entity));

                    if(verbose)
                        $this.addProperty(childrenEntitiesMetadata, entity.type, $this.getEntityMetadata(entity));
                }
            };
        });

        // filter entities that were covered by this composite entity
        for(let i=0; i<entities.length; i++){
            if(!coveredSet.has(i))
                filteredEntities.push(entities[i]);
        }

        this.addProperty(entitiesAndMetadata.entities, compositeEntity.parentType, childrenEntites);
        if(verbose){
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
    private addProperty(obj: any, key: string, value: any){
        if(key in obj)
            obj[key] = obj[key].concat(value);
        else
            obj[key] = [value];
    }
}

