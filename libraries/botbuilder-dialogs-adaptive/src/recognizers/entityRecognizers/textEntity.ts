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
    public type = 'text';

    public text: string;

    /**
     * Initializes a new instance of the [TextEntity](xref:botbuilder-dialogs-adaptive.TextEntity) class.
     * @param text The text value.
     */
    public constructor(text?: string) {
        this.text = text;
    }
}
