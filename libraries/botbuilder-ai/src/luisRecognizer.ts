/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext } from 'botbuilder';
import { LuisResult, Intent, Entity, CompositeEntity } from 'botframework-luis/lib/models';
import LuisClient = require('botframework-luis');


export interface LuisRecognizerSettings {
    /** Your models AppId */
    appId: string;

    /** Your subscription key. */
    subscriptionKey: string;

    /** (Optional) service endpoint to call. Defaults to "https://westus.api.cognitive.microsoft.com". */
    serviceEndpoint?: string;

    /** (Optional) if set to true, we return the metadata of the returned intents/entities. Defaults to true */
    verbose?: boolean;

    /** (Optional) request options passed to service call.  */
    options?: { 
        timezoneOffset? : number; 
        verbose? : boolean; 
        forceSet? : string; 
        allowSampling?: string; 
        customHeaders?: { [headerName: string]: string; };
    };
}

export interface LuisRecognizerResult {
    /** Utterance sent to LUIS */
    text: string;

    /** Intents recognized for the utterance. A map of intent names to score is returned. */
    intents: { [name:string]: number; };

    /** Entities  */
    entities: any;
}

export class LuisRecognizer implements Middleware {
    private settings: LuisRecognizerSettings
    private luisClient: LuisClient;
    private cacheKey = Symbol('results');

    /**
     * Creates a new LuisRecognizer instance.
     * @param settings Settings used to configure the instance.
     */
    constructor(settings: LuisRecognizerSettings) {
        this.settings = Object.assign({}, settings);

        // Create client and override callbacks
        const baseUri = (this.settings.serviceEndpoint || 'https://westus.api.cognitive.microsoft.com');
        this.luisClient = this.createClient(baseUri + '/luis/');
    }

    public onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        return this.recognize(context, true)
                   .then(() => next());
    }

    /**
     * Returns the results cached from a previous call to [recognize()](#recognize) for the current
     * turn with the user.  This will return `undefined` if recognize() hasn't been called for the
     * current turn.
     * @param context Context for the current turn of conversation with the use.
     */
    public get(context: TurnContext): LuisRecognizerResult|undefined {
        return context.services.get(this.cacheKey);
    }

    /**
     * Calls LUIS to recognize intents and entities in a users utterance. The results of the call
     * will be cached to the context object for the turn and future calls to recognize() for the 
     * same context object will result in the cached value being returned. This behavior can be 
     * overridden using the `force` parameter.   
     * @param context Context for the current turn of conversation with the use.
     * @param force (Optional) flag that if `true` will force the call to LUIS even if a cached result exists. Defaults to a value of `false`. 
     */
    public recognize(context: TurnContext, force?: boolean): Promise<LuisRecognizerResult> {
        const cached = context.services.get(this.cacheKey);
        if (force || !cached) {
            const utterance = context.activity.text || '';
            return this.luisClient.getIntentsAndEntitiesV2(this.settings.appId, this.settings.subscriptionKey, utterance, this.settings.options)
                .then((result : LuisResult) => {
                    // Map results
                    const recognizerResult: LuisRecognizerResult = {
                        text: result.query,
                        intents: this.getIntents(result),
                        entities: this.getEntitiesAndMetadata(result.entities, result.compositeEntities, this.settings.verbose)
                    };
                    
                    // Write to cache
                    context.services.set(this.cacheKey, recognizerResult);
                    return recognizerResult;
                });
    
        }
        return Promise.resolve(cached);
    }

    /**
     * Called internally to create a LuisClient instance. This is exposed to enable better unit 
     * testing of teh recognizer.
     * @param baseUri Service endpoint being called.
     */
    protected createClient(baseUri: string): LuisClient {
        return new LuisClient(baseUri);
    }

    /**
     * Returns the name of the top scoring intent from a set of LUIS results.
     * @param results Result set to be searched.
     * @param defaultIntent (Optional) intent name to return should a top intent be found. Defaults to a value of `None`.
     * @param minScore (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned.  Defaults to a value of `0.0`.  
     */
    static topIntent(results: LuisRecognizerResult|undefined, defaultIntent = 'None', minScore = 0.0): string {
        let topIntent: string|undefined = undefined;
        let topScore = -1;
        if (results && results.intents) {
            for (const name in results.intents) {
                const score = results.intents[name];
                if (typeof score === 'number' && score > topScore && score >= minScore) {
                    topIntent = name;
                    topScore = score;
                }
            }
        }
        return topIntent || defaultIntent;
    }

    private getIntents(luisResult: LuisResult) : any {
        const intents: { [name:string]: number; }  = {}
        if(luisResult.intents){
            luisResult.intents.reduce((prev : any, curr : Intent) => {
                prev[curr.intent] = curr.score;
                return prev;
            }, intents);
        } else {
            const topScoringIntent = luisResult.topScoringIntent;
            intents[(topScoringIntent).intent] = topScoringIntent.score;
        }
        return intents;
    }

    private getEntitiesAndMetadata(entities: Entity[], compositeEntities : CompositeEntity[] | undefined, verbose: boolean) : any {
        let entitiesAndMetadata : any = verbose ? {$instance: {} } : {};
        let compositeEntityTypes : string[] = [];

        // We start by populating composite entities so that entities covered by them are removed from the entities list
        if(compositeEntities){
            compositeEntityTypes = compositeEntities.map(compositeEntity => compositeEntity.parentType);
            compositeEntities.forEach(compositeEntity => {
                entities = this.populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
            });
        }

        entities.forEach(entity => {
            // we'll address composite entities separately
            if(compositeEntityTypes.indexOf(entity.type) > -1) {
                return;
            }

            this.addProperty(entitiesAndMetadata, this.getNormalizedEntityType(entity), this.getEntityValue(entity));
            if(verbose){
                this.addProperty(entitiesAndMetadata.$instance, this.getNormalizedEntityType(entity), this.getEntityMetadata(entity));
            }
        });

        return entitiesAndMetadata;
    }

    private getEntityValue(entity: Entity) : any {
        if(entity.type.startsWith("builtin.datetimeV2.") && entity.resolution && entity.resolution.values && entity.resolution.values.length){
            return entity.resolution.values[0].timex;
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
            startIndex: entity.startIndex,
            endIndex: entity.endIndex,
            text: entity.entity,
            score: entity.score
        };
    }

    private getNormalizedEntityType(entity: Entity) : string {
        return entity.type.replace(/\./g, "_");
    }

    private populateCompositeEntity(compositeEntity: CompositeEntity, entities: Entity[], entitiesAndMetadata : any, verbose: boolean) : Entity[] {
        let childrenEntites : any = verbose ? { $instance: {} } : {};
        let childrenEntitiesMetadata : any = {};
        
        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        let compositeEntityMetadata : Entity | undefined = entities.find(entity => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text 
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value
        });

        let filteredEntities : Entity[] = [];
        if(verbose){
            childrenEntitiesMetadata = this.getEntityMetadata(compositeEntityMetadata);
            childrenEntitiesMetadata.$instance = {};
        }

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
                    this.addProperty(childrenEntites, this.getNormalizedEntityType(entity), this.getEntityValue(entity));

                    if(verbose)
                        this.addProperty(childrenEntites.$instance, this.getNormalizedEntityType(entity), this.getEntityMetadata(entity));
                }
            };
        });

        // filter entities that were covered by this composite entity
        for(let i=0; i<entities.length; i++){
            if(!coveredSet.has(i))
                filteredEntities.push(entities[i]);
        }

        this.addProperty(entitiesAndMetadata, compositeEntity.parentType, childrenEntites);
        if(verbose){
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
    private addProperty(obj: any, key: string, value: any){
        if(key in obj)
            obj[key] = obj[key].concat(value);
        else
            obj[key] = [value];
    }
}
