/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CancelAllDialogsBase } from './cancelAllDialogsBase';

/**
 * Command to cancel all of the current dialogs by emitting an event which must be caught to prevent cancelation from propagating.
 */
export class CancelDialog<O extends object = {}> extends CancelAllDialogsBase<O> {
    public constructor();

    /**
     * Initializes a new instance of the `CancelDialog` class.
     * @param eventName Expression for event name.
     * @param eventValue Optional. Expression for event value.
     */
    public constructor(eventName: string, eventValue?: string);

    /**
     * Initializes a new instance of the `CancelDialog` class.
     * @param eventName Optional. Expression for event name.
     * @param eventValue Optional. Expression for event value.
     */
    public constructor(eventName?: string, eventValue?: string) {
        super(eventName, eventValue, false);
    }
}
