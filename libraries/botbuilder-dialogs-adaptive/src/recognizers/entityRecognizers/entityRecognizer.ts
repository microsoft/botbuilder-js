/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { Entity } from 'botbuilder-core';

export interface EntityRecognizer {
    recognizeEntities(dialogContext: DialogContext, text: string, locale: string, entities: Entity[]): Promise<Entity[]>;
}
