/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Entity } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';

export interface EntityRecognizer {
    recognizeEntities(
        dialogContext: DialogContext,
        text: string,
        locale: string,
        entities: Entity[]
    ): Promise<Entity[]>;
}
