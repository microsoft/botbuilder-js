/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LUISRuntimeModels as LuisModels } from '@azure/cognitiveservices-luis-runtime';
import { LuisRecognizerInternal } from './luisRecognizerOptions'
import { LuisApplication , LuisRecognizerOptionsV3} from './luisRecognizer'
import { NullTelemetryClient, TurnContext , RecognizerResult} from 'botbuilder-core';
const fetch = require('node-fetch');
const LUIS_TRACE_TYPE = 'https://www.luis.ai/schemas/trace';
const LUIS_TRACE_NAME = 'LuisRecognizer';
const LUIS_TRACE_LABEL = 'LuisV3 Trace';
const _dateSubtypes = [ "date", "daterange", "datetime", "datetimerange", "duration", "set", "time", "timerange" ];    
const _geographySubtypes = [ "poi", "city", "countryRegion", "continet", "state" ];
const MetadataKey = "$instance";


export function isLuisRecognizerOptionsV3(options: any): options is LuisRecognizerOptionsV3 {
    return (options.apiVersion && options.apiVersion === "v3");
}

export class LuisRecognizerV3 extends LuisRecognizerInternal {

    constructor (application: LuisApplication, options?: LuisRecognizerOptionsV3) { 
        super(application);

        this.predictionOptions = {
            includeAllIntents: false,
            includeInstanceData: true,
            log: true,
            preferExternalEntities: true,
            slot: 'production',
            telemetryClient: new NullTelemetryClient(), 
            logPersonalInformation: false, 
            includeAPIResults: true,
            ...options
        };
    }

    public predictionOptions: LuisRecognizerOptionsV3;

    async recognizeInternalAsync(context: TurnContext): Promise<RecognizerResult> {
        const utterance: string = context.activity.text || '';
        if (!utterance.trim()) {
            // Bypass LUIS if the activity's text is null or whitespace
            return Promise.resolve({
                text: utterance,
                intents: { '': { score: 1 } },
                entities: {},
            });
        }

        const uri = this.buildUrl();
        const httpOptions = this.buildRequestBody(utterance);

        const data = await fetch(uri, httpOptions)
        const response = await data.json();
        const result: RecognizerResult = {
            text: utterance,
            intents : getIntents(response.prediction),
            entities : extractEntitiesAndMetadata(response.prediction),
            sentiment: getSentiment(response.prediction),
            luisResult: (this.predictionOptions.includeAPIResults ? response : null)
        }

        if (this.predictionOptions.includeInstanceData) {
            result.entities[MetadataKey] = result.entities[MetadataKey] ? result.entities[MetadataKey] : {}
        }

        this.emitTraceInfo(context, response.prediction, result);

        return result;
 
    }

    private buildUrl() {
        const baseUri = this.application.endpoint || 'https://westus.api.cognitive.microsoft.com';
        let uri =  `${baseUri}/luis/prediction/v3.0/apps/${this.application.applicationId}`;

        if (this.predictionOptions.version) {
            uri += `/versions/${this.predictionOptions.version}/predict`
        } else {
            uri += `/slots/${this.predictionOptions.slot}/predict`
        }
        
        const params = `?verbose=${this.predictionOptions.includeInstanceData}&log=${this.predictionOptions.log}&show-all-intents=${this.predictionOptions.includeAllIntents}`;

        uri += params;
        return uri;
    }

    private buildRequestBody(utterance: string){
        const content = { 
            'query': utterance, 
            'options': { 
                'overridePredictions': this.predictionOptions.preferExternalEntities  
            }
        };

        if (this.predictionOptions.dynamicLists){
            content['dynamicLists'] = this.predictionOptions.dynamicLists
        }

        if (this.predictionOptions.externalEntities){
            content['externalEntities'] = this.predictionOptions.externalEntities
        }

        return {
            method: 'POST',
            body: JSON.stringify(content),
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key' : this.application.endpointKey,
            }
        };

    }

    private emitTraceInfo(context: TurnContext, luisResult: LuisModels.LuisResult, recognizerResult: RecognizerResult): Promise<any> {
        const traceInfo: any = {
            recognizerResult: recognizerResult,
            luisResult: luisResult,
            luisOptions: this.predictionOptions,
            luisModel: {
                ModelID: this.application.applicationId
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
}

function normalizeName(name) {
    return name.replace(/\.| /g, '_');
}

function  getIntents(luisResult) {
    // let intents: { [name: string]: { score: number } } = {};
    const intents = {};
    if (luisResult.intents) {
        for (let intent in luisResult.intents) {
            intents[normalizeName(intent)] = { score: luisResult.intents[intent].score};
        }
    }

    return intents;
}

function normalizeEntity(entity) {
    const splitEntity = entity.split(':');
    const entityName = splitEntity[splitEntity.length -1]; 
    return entityName.replace(/\.| /g, '_');
}

function mapProperties(source, inInstance){
    let result = source;
    if (source instanceof Array) {
        let narr = [];
        for (let item of source) {

            // Check if element is geographyV2
            let isGeographyV2 = '';
            if (item['type'] && _geographySubtypes.includes(item['type']))
            {
                isGeographyV2 = item['type'];
            }       

            if (!inInstance && isGeographyV2) {
                let geoEntity: any = {};
                for (let itemProps in item) {
                    if (itemProps === 'value')
                    {
                        geoEntity.location = item[itemProps];
                    }
                }
                geoEntity.type = isGeographyV2;
                narr.push(geoEntity);
            } else {
                narr.push(mapProperties(item, inInstance));
            }
        }
        result = narr;

    } else if (source instanceof Object && typeof source !== 'string') {
        let nobj: any = {};

        // Fix datetime by reverting to simple timex
        if (!inInstance && source.type && typeof source.type === 'string' && _dateSubtypes.includes(source.type))
        {
            let timexs = source.values;
            let arr = [];
            if (timexs)
            {
                let unique = [];
                for(let elt of timexs)
                {
                    if (elt.timex && !unique.includes(elt.timex)) {
                        unique.push(elt.timex);
                    }
                }

                for (let timex of unique)
                {
                    arr.push(timex);
                }

                nobj.timex = arr;
            }

            nobj.type = source.type;
        }
        else
        {
            // Map or remove properties
            for (let property in source)
            {
                let name = normalizeEntity(property);
                let isArray = source[property] instanceof Array;
                let isString = typeof source[property] === 'string';
                let isInt = Number.isInteger(source[property]);
                let val = mapProperties(source[property], inInstance || property == MetadataKey);
                if (name == "datetime" && isArray)
                {
                    nobj.datetimeV1 = val;
                }
                else if (name == "datetimeV2" && isArray)
                {
                    nobj.datetime = val;
                }
                else if (inInstance)
                {
                    // Correct $instance issues
                    if (name == "length" && isInt)
                    {
                        nobj['endIndex'] = source[name] + source.startIndex;
                    }
                    else if (!((isInt && name === "modelTypeId") ||
                               (isString && name === "role")))
                    {
                        nobj[name] = val;
                    }
                }
                else
                {
                    // Correct non-$instance values
                    if (name == "unit" && isString)
                    {
                        nobj.units = val;
                    }
                    else
                    {
                        nobj[name] = val;
                    }
                }
            }
            
        }
        result = nobj;
    }
    return result;
}

function extractEntitiesAndMetadata(prediction){

    const entities = prediction.entities;
    return mapProperties(entities, false);
}

function getSentiment(luis): any {
    let result: any;
    if (luis.sentiment) {
        result = {
            label: luis.sentiment.label,
            score: luis.sentiment.score
        };
    }

    return result;
}


