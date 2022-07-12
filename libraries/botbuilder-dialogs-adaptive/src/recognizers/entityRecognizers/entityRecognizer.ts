/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, Entity, RecognizerResult } from 'botbuilder';
import { DialogContext } from 'botbuilder-dialogs';
import { AdaptiveRecognizer } from '../adaptiveRecognizer';
import { TextEntity } from './textEntity';

/**
 * Entity recognizers base class.
 */
export class EntityRecognizer extends AdaptiveRecognizer {
    /**
     * To recognize intents and entities in a users utterance.
     *
     * @param {DialogContext} dialogContext Dialog Context.
     * @param {Partial<Activity>} activity Activity.
     * @param {object} _telemetryProperties Additional properties to be logged to telemetry with event.
     * @param {object} _telemetryMetrics Additional metrics to be logged to telemetry with event.
     * @returns {Promise<RecognizerResult>} Analysis of utterance.
     */
    async recognize(
        dialogContext: DialogContext,
        activity: Partial<Activity>,
        _telemetryProperties?: Record<string, string>,
        _telemetryMetrics?: Record<string, number>
    ): Promise<RecognizerResult> {
        // Identify matched intents
        const text = activity.text ?? '';

        const recognizerResult: RecognizerResult = {
            text,
            intents: {},
        };

        if (!text) {
            // nothing to recognize, return empty result
            return recognizerResult;
        }

        const textEntity: Entity = new TextEntity(text);
        textEntity.start = 0;
        textEntity.end = text.length;
        textEntity.score = 1.0;

        // add entities from regexRecognizer to the entities pool
        const entityPool: Entity[] = [textEntity];

        // process entities using EntityRecognizer
        const newEntities = await this.recognizeEntities(
            dialogContext,
            dialogContext.context.activity.text,
            dialogContext.context.activity.locale,
            entityPool
        );
        entityPool.push(...newEntities);

        // map entityPool of Entity objects => RecognizerResult entity format
        const entities: Record<string, unknown> = {};
        entityPool
            .filter((e) => e !== textEntity)
            .forEach((entityResult: Entity) => {
                const { type: entityType, text: entityText } = entityResult;

                // add value
                entities[`${entityType}`] ??= [];
                const value = entities[`${entityType}`];
                if (Array.isArray(value)) {
                    value.push(entityText);
                }

                // get/create $instance
                entities['$instance'] ??= {};
                const instanceRoot = entities['$instance'];

                // add instanceData
                instanceRoot[`${entityType}`] ??= [];
                const instanceData = instanceRoot[`${entityType}`];

                instanceData.push({
                    startIndex: entityResult.start,
                    endIndex: entityResult.end,
                    score: 1.0,
                    text: entityResult.text,
                    type: entityResult.type,
                    resolution: entityResult.resolution,
                });
            });

        recognizerResult.entities = entities;
        return recognizerResult;
    }

    /**
     * Recognizes entities from an [Entity](xref:botbuilder-core.Entity) list.
     *
     * @param {DialogContext} _dialogContext The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param {string} _text Text to recognize.
     * @param {string} _locale Locale to use.
     * @param {Entity[]} _entities The [Entity](xref:botbuilder-core.Entity) list to be recognized.
     * @returns {Promise<Entity[]>} Recognized [Entity](xref:botbuilder-core.Entity) list.
     */
    async recognizeEntities(
        _dialogContext: DialogContext,
        _text: string,
        _locale: string,
        _entities: Entity[]
    ): Promise<Entity[]> {
        return [];
    }
}
