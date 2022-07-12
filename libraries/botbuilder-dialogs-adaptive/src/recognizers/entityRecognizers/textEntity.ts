/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Entity } from 'botbuilder';

/**
 * Text entity base class.
 */
export class TextEntity implements Entity {
    type = 'text';

    text: string;

    /**
     * Initializes a new instance of the [TextEntity](xref:botbuilder-dialogs-adaptive.TextEntity) class.
     *
     * @param text The text value.
     */
    constructor(text?: string) {
        this.text = text;
    }
}
