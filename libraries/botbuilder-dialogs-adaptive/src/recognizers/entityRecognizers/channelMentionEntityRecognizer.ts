/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, RecognizerResult } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { AdaptiveRecognizer } from '../adaptiveRecognizer';

/**
 * Recognizer which maps channel activity.entities of type mention into [RecognizerResult](xref:botbuilder-core.RecognizerResult) format.
 */
export class ChannelMentionEntityRecognizer extends AdaptiveRecognizer {
    public static $kind = 'Microsoft.ChannelMentionEntityRecognizer';

    /**
     * To recognize intents and entities in a users utterance.
     *
     * @param {DialogContext} dialogContext Dialog Context.
     * @param {Partial<Activity>} activity Activity.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with event.
     * @param {object} telemetryMetrics Additional metrics to be logged to telemetry with event.
     * @returns {Promise<RecognizerResult>} Analysis of utterance.
     */
    public async recognize(
        dialogContext: DialogContext,
        activity: Partial<Activity>,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<RecognizerResult> {
        const result: RecognizerResult = {
            text: '',
            intents: {},
            entities: {},
        };

        const entities = result.entities;

        // prompt external mention entities from the activity into recognizer result
        if (activity.entities) {
            let iStart = 0;
            activity.entities
                .filter((e) => e.type === 'mention')
                .forEach((entity) => {
                    entities.channelMention ??= [];
                    entities.channelMention.push(entity.mentioned);

                    entities['$instance'] ??= {};
                    const instance = entities['$instance'];
                    instance.channelMention ??= [];

                    const mentionedText = `${entity.text}`;
                    iStart = activity.text.indexOf(mentionedText, iStart);
                    if (iStart >= 0) {
                        instance.channelMention.push({
                            startIndex: iStart,
                            endIndex: iStart + mentionedText.length,
                            text: mentionedText,
                            score: 1.0,
                        });

                        // note, we increment so next pass through continues after the token we just processed.
                        iStart++;
                    }
                });
        }

        return result;
    }
}
