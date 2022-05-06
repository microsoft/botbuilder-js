/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    ArrayExpression,
    ArrayExpressionConverter,
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';
import { Converter } from 'botbuilder-dialogs';
import { ExternalEntity } from './externalEntity';

export interface LuisAdaptivePredictionOptionsConfiguration {
    /**
     * Gets or sets a value indicating whether all intents come back or only the top one.
     */
    includeAllIntents?: boolean | string | Expression | BoolExpression;

    /**
     * Gets or sets a value indicating whether or not instance data should be included in response.
     */
    includeInstanceData?: boolean | string | Expression | BoolExpression;

    /**
     * Gets or sets a value indicating whether API results should be included.
     */
    includeAPIResults?: boolean | string | Expression | BoolExpression;

    /**
     * Gets or sets a value indicating whether queries should be logged in LUIS.
     */
    log?: boolean | string | Expression | BoolExpression;

    /**
     * Gets or sets external entities recognized in the query.
     */
    externalEntities?: ExternalEntity[] | string | Expression | ArrayExpression<ExternalEntity>;

    /**
     * Gets or sets a value indicating whether external entities should override other means of recognizing entities.
     */
    preferExternalEntities?: boolean | string | Expression | BoolExpression;

    /**
     * Gets or sets datetimeV2 offset. The format for the datetimeReference is ISO 8601.
     */
    dateTimeReference?: string | Expression | StringExpression;

    /**
     * Gets or sets the LUIS slot to use for the application.
     */
    slot?: string | Expression | StringExpression;
}
/**
 * Converts optional parameters for a LUIS prediction request.
 */
export class LuisAdaptivePredictionOptionsConverter
    implements Converter<LuisAdaptivePredictionOptionsConfiguration, LuisAdaptivePredictionOptions> {
    /**
     * Converts the provided options configuration into an object of [LuisAdaptivePredictionOptions](xref:botbuilder-ai.LuisAdaptivePredictionOptions) type.
     *
     * @param config Options configuration for LuisAdaptivePredictionOptions.
     * @returns The converted options configuration to the [LuisAdaptivePredictionOptions](xref:botbuilder-ai.LuisAdaptivePredictionOptions) interface.
     */
    convert(config: LuisAdaptivePredictionOptionsConfiguration): LuisAdaptivePredictionOptions {
        const options = Object.entries(config).reduce((options: LuisAdaptivePredictionOptions, [key, value]) => {
            switch (key) {
                case 'includeAllIntents':
                case 'includeInstanceData':
                case 'includeAPIResults':
                case 'log':
                case 'preferExternalEntities':
                    options[`${key}`] = this.boolExpressionConverter.convert(value);
                    break;
                case 'dateTimeReference':
                case 'slot':
                    options[`${key}`] = this.stringExpressionConverter.convert(value);
                    break;
                case 'externalEntities':
                    options[`${key}`] = this.arrayExpressionConverter.convert(value);
                    break;
            }
            return options;
        }, {});

        // Assign default values
        options.includeAllIntents ??= new BoolExpression(false);
        options.includeInstanceData ??= new BoolExpression(false);
        options.includeAPIResults ??= new BoolExpression(false);
        options.log ??= new BoolExpression(true);
        options.preferExternalEntities ??= new BoolExpression(true);
        options.slot ??= new StringExpression('production');
        return options;
    }
    private boolExpressionConverter = new BoolExpressionConverter();
    private stringExpressionConverter = new StringExpressionConverter();
    private arrayExpressionConverter = new ArrayExpressionConverter<ExternalEntity>();
}

/**
 * Optional parameters for a LUIS prediction request.
 */
export interface LuisAdaptivePredictionOptions {
    /**
     * Gets or sets a value indicating whether all intents come back or only the top one.
     */
    includeAllIntents?: BoolExpression;

    /**
     * Gets or sets a value indicating whether or not instance data should be included in response.
     */
    includeInstanceData?: BoolExpression;

    /**
     * Gets or sets a value indicating whether API results should be included.
     */
    includeAPIResults?: BoolExpression;

    /**
     * Gets or sets a value indicating whether queries should be logged in LUIS.
     */
    log?: BoolExpression;

    /**
     * Gets or sets external entities recognized in the query.
     */
    externalEntities?: ArrayExpression<ExternalEntity>;

    /**
     * Gets or sets a value indicating whether external entities should override other means of recognizing entities.
     */
    preferExternalEntities?: BoolExpression;

    /**
     * Gets or sets datetimeV2 offset. The format for the datetimeReference is ISO 8601.
     */
    dateTimeReference?: StringExpression;

    /**
     * Gets or sets the LUIS slot to use for the application.
     */
    slot?: StringExpression;
}
