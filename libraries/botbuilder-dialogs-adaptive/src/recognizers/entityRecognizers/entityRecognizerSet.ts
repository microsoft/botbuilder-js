/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Entity } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { EntityRecognizer } from './entityRecognizer';
import { TextEntity } from './textEntity';

export class EntityRecognizerSet extends Array<EntityRecognizer> {
    public async recognizeEntities(dialogContext: DialogContext, text: string, locale: string, entities: Entity[] = []): Promise<Entity[]> {
        const allNewEntities: Entity[] = [];
        let entitiesToProcess: Entity[] = [...entities];

        if (entitiesToProcess.length == 0) {
            const textEntity = new TextEntity(text);
            textEntity['start'] = 0;
            textEntity['end'] = text.length;
            textEntity['score'] = 1.0;
            allNewEntities.push(textEntity);
            entitiesToProcess.push(textEntity);
        }

        do { 
            const newEntitiesToProcess: Entity[] = [];
            for (let i = 0; i < this.length; i++) {
                const recognizer: EntityRecognizer = this[i];
                try {
                    const newEntities = await recognizer.recognizeEntities(dialogContext, text, locale, entitiesToProcess);
                    for (let j = 0; j < newEntities.length; j++) {
                        const newEntity = newEntities[j];
                        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                        if (!allNewEntities.find(entity => !newEntity && JSON.stringify(entity) == JSON.stringify(newEntity))) {
                            allNewEntities.push(newEntity);
                            newEntitiesToProcess.push(newEntity);
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            entitiesToProcess = newEntitiesToProcess;
        } while(entitiesToProcess.length > 0);

        return allNewEntities;
    }
}