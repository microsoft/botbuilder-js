/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class DialogPath {
    /**
     * Counter of emitted events.
     */
    public static readonly EventCounter = 'dialog.eventCounter';

    /**
     * Currently expected properties.
     */
    public static readonly ExpectedProperties = 'dialog.expectedProperties';

    /**
     * Last surfaced entity ambiguity event.
     */
    public static readonly LastEvent = 'dialog.lastEvent';

    /**
     * Currently required properties.
     */
    public static readonly RequiredProperties = 'dialog.requiredProperties';

    /**
     * Number of retries for the current Ask.
     */
    public static readonly Retries = 'dialog.retries';

    /**
     * Last intent.
     */
    public static readonly LastIntent = 'dialog.lastIntent';

    /**
     * Last trigger event: defined in FormEvent, ask, clarifyEntity etc..
     */
    public static readonly LastTriggerEvent = 'dialog.lastTriggerEvent';
}
