/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Culture } from '@microsoft/recognizers-text-suite';
import { Activity, Entity, RecognizerResult } from 'botbuilder';
import { Converter, ConverterFactory, DialogContext } from 'botbuilder-dialogs';
import { IntentPattern } from './intentPattern';
import { EntityRecognizer, TextEntity, EntityRecognizerSet } from './entityRecognizers';
import { RecognizerSetConfiguration } from './recognizerSet';
import { AdaptiveRecognizer } from './adaptiveRecognizer';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

type IntentPatternInput = {
    intent: string;
    pattern: string;
};

class IntentPatternsConverter implements Converter<IntentPatternInput[], IntentPattern[]> {
    convert(items: IntentPatternInput[] | IntentPattern[]): IntentPattern[] {
        const results: IntentPattern[] = [];
        items.forEach((item) => {
            results.push(item instanceof IntentPattern ? item : new IntentPattern(item.intent, item.pattern));
        });
        return results;
    }
}

export interface RegexRecognizerConfiguration extends RecognizerSetConfiguration {
    intents?: IntentPatternInput[] | IntentPattern[];
}

/**
 * Recognizer implementation which uses regex expressions to identify intents.
 */
export class RegexRecognizer extends AdaptiveRecognizer implements RegexRecognizerConfiguration {
    static $kind = 'Microsoft.RegexRecognizer';

    /**
     * Array of patterns -> intent names.
     */
    intents: IntentPattern[] = [];

    /**
     * The entity recognizers.
     */
    entities: EntityRecognizer[] = [];

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof RegexRecognizerConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'intents':
                return new IntentPatternsConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Runs current DialogContext.TurnContext.Activity through a recognizer and returns a [RecognizerResult](xref:botbuilder-core.RecognizerResult).
     *
     * @param dialogContext The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param activity [Activity](xref:botframework-schema.Activity) to recognize.
     * @param telemetryProperties Optional, additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Optional, additional metrics to be logged to telemetry with the LuisResult event.
     * @returns {Promise<RecognizerResult>} Analysis of utterance.
     */
    async recognize(
        dialogContext: DialogContext,
        activity: Activity,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): Promise<RecognizerResult> {
        const text = activity.text ?? '';
        const locale = activity.locale ?? Culture.English;

        const recognizerResult: RecognizerResult = {
            text: text,
            intents: {},
            entities: {},
        };

        if (!text) {
            // nothing to recognize, return empty result
            return recognizerResult;
        }

        const textEntity: Entity = new TextEntity(text);
        textEntity.start = 0;
        textEntity.end = text.length;
        textEntity.score = 1.0;

        const entityPool: Entity[] = [textEntity];

        for (const intentPattern of this.intents) {
            const matches: RegExpExecArray[] = [];
            let matched: RegExpExecArray;
            const regexp = intentPattern.regex;
            while ((matched = regexp.exec(text))) {
                matches.push(matched);
                if (regexp.lastIndex == text.length || !regexp.lastIndex) {
                    break; // to avoid infinite loop
                }
            }

            if (matches.length === 0) {
                continue;
            }

            // TODO length weighted match and multiple intents
            const intentKey = intentPattern.intent.split(' ').join('_');
            recognizerResult.intents[`${intentKey}`] ??= {
                score: 1.0,
                pattern: intentPattern.pattern,
            };

            matches.forEach((match: RegExpExecArray) => {
                if (match.groups) {
                    Object.entries(match.groups)
                        .filter(([_name, text]) => text !== undefined)
                        .forEach(([name, text]) => {
                            const entity: Entity = {
                                type: name,
                                text,
                                start: match.index,
                                end: match.index + text.length,
                            };
                            entityPool.push(entity);
                        });
                }
            });
        }

        if (this.entities) {
            const entitySet = new EntityRecognizerSet(...this.entities);
            const newEntities = await entitySet.recognizeEntities(dialogContext, text, locale, entityPool);
            entityPool.push(...newEntities);
        }

        entityPool
            .filter((e) => e !== textEntity)
            .forEach((entityResult) => {
                const { type: entityType, text: entityText } = entityResult;

                recognizerResult.entities[`${entityType}`] ??= [];
                recognizerResult.entities[`${entityType}`].push(entityText);

                recognizerResult.entities['$instance'] ??= {};
                const instanceRoot = recognizerResult.entities['$instance'];

                instanceRoot[`${entityType}`] ??= [];
                const instanceData = instanceRoot[`${entityType}`];

                const instance = {
                    startIndex: entityResult.start,
                    endIndex: entityResult.end,
                    score: 1.0,
                    text: entityText,
                    type: entityType,
                    resolution: entityResult.resolution,
                };
                instanceData.push(instance);
            });

        if (Object.entries(recognizerResult.intents).length == 0) {
            recognizerResult.intents.None = { score: 1.0 };
        }

        await dialogContext.context.sendTraceActivity(
            'RegexRecognizer',
            recognizerResult,
            'RecognizerResult',
            'Regex RecognizerResult'
        );
        this.trackRecognizerResult(
            dialogContext,
            TelemetryLoggerConstants.RegexRecognizerResultEvent,
            this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties, dialogContext),
            telemetryMetrics
        );
        return recognizerResult;
    }
}
