/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringExpressionConverter, ArrayExpressionConverter, BoolExpressionConverter } from 'adaptive-expressions';
import { LuisAdaptiveRecognizer } from './luisAdaptiveRecognizer';

/**
 * Declarative components in QnAMaker.
 */
export class LuisComponentRegistration {
    public getDeclarativeTypes(_resourceExplorer: any) {
        return [{
            kind: 'Microsoft.LuisRecognizer',
            factory: LuisAdaptiveRecognizer,
            converters: {
                'applicationId': new StringExpressionConverter(),
                'dynamicLists': new ArrayExpressionConverter(),
                'endpoint': new StringExpressionConverter(),
                'endpointKey': new StringExpressionConverter(),
                'logPersonalInformation': new BoolExpressionConverter()
            }
        }];
    }
}