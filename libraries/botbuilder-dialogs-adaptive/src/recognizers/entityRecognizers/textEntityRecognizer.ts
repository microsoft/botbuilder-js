/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Culture } from '@microsoft/recognizers-text';
import { Entity } from 'botbuilder';
import { DialogContext, ModelResult } from 'botbuilder-dialogs';
import { EntityRecognizer } from './entityRecognizer';
import { TextEntity } from './textEntity';

/**
 * TextEntityRecognizer - base class for Text.Recogizers from the text recognizer library.
 */
export abstract class TextEntityRecognizer extends EntityRecognizer {
    /**
     * Recognizes entities from an [Entity](xref:botframework-schema.Entity) list.
     *
     * @param {DialogContext} dialogContext The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param {string} text Text to recognize.
     * @param {string} locale Locale to use.
     * @param {Entity[]} entities The [Entity](xref:botframework-schema.Entity) array to be recognized.
     * @returns {Promise<Entity[]>} Recognized [Entity](xref:botframework-schema.Entity) list Promise.
     */
    async recognizeEntities(
        dialogContext: DialogContext,
        text: string,
        locale: string,
        entities: Entity[]
    ): Promise<Entity[]> {
        const culture = Culture.mapToNearestLanguage(locale ?? '');
        return entities
            .filter((e: Entity): boolean => e.type == 'text')
            .map(
                (e: Entity): TextEntity => {
                    const textEntity = new TextEntity();
                    return Object.assign(textEntity, e);
                }
            )
            .reduce((entities: Entity[], textEntity: TextEntity) => {
                return entities.concat(
                    this._recognize(textEntity.text, culture).map((result: ModelResult) => {
                        const newEntity: Entity = Object.assign(
                            {
                                type: result.typeName,
                            },
                            result
                        );
                        delete newEntity.typeName;
                        // The text recognizer libraries return models with End => array inclusive endIndex.
                        // We want end to be (end-start) = length, length = endIndex - startIndex.
                        newEntity.end += 1;
                        return newEntity;
                    })
                );
            }, []);
    }

    protected abstract _recognize(text: string, culture: string): ModelResult[];
}
