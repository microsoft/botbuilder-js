/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { APIError, CompositeChildModel, CompositeEntityModel, EntityModel, IntentModel, LuisResult, Sentiment } from "./model";

/* tslint:disable:no-unused-variable */
export let primitives = [
    'string',
    'boolean',
    'double',
    'integer',
    'long',
    'float',
    'number',
    'any'
 ];
 
 export let enumsMap: {[index: string]: any} = {
}

export let typeMap: {[index: string]: any} = {
'APIError': APIError,
'CompositeChildModel': CompositeChildModel,
'CompositeEntityModel': CompositeEntityModel,
'EntityModel': EntityModel,
'IntentModel': IntentModel,
'LuisResult': LuisResult,
'Sentiment': Sentiment,
}