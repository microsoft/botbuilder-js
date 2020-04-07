/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Entity } from 'botbuilder-core';

export class TextEntity implements Entity {
    public type: string = 'text';

    public text: string;

    public constructor(text?: string) {
        this.text = text;
    }
}