/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CancelAllDialogsBase } from './cancelAllDialogsBase';

/**
 * Command to cancel all of the current [Dialogs](xref:botbuilder-dialogs.Dialog) by emitting an event that must be caught to prevent cancellation from propagating.
 */
export class CancelDialog<O extends object = {}> extends CancelAllDialogsBase<O> {
    static $kind = 'Microsoft.CancelDialog';

    constructor();

    /**
     * Initializes a new instance of the [CancelDialog](xref:botbuilder-dialogs-adaptive.CancelDialog) class.
     *
     * @param eventName Expression for event name.
     * @param eventValue Optional. Expression for event value.
     */
    constructor(eventName: string, eventValue?: string);

    /**
     * Initializes a new instance of the [CancelDialog](xref:botbuilder-dialogs-adaptive.CancelDialog) class.
     *
     * @param eventName Optional. Expression for event name.
     * @param eventValue Optional. Expression for event value.
     */
    constructor(eventName?: string, eventValue?: string) {
        super(eventName, eventValue, false);
    }
}
