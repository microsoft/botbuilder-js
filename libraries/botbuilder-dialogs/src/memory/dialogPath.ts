/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class DialogPath {
    /// Counter of emitted events.
    public static readonly eventCounter = 'dialog.eventCounter';

    /// Currently expected properties.
    public static readonly expectedProperties = 'dialog.expectedProperties';

    /// Last surfaced entity ambiguity event.
    public static readonly lastEvent = 'dialog.lastEvent';

    /// Currently required properties.
    public static readonly requiredProperties = 'dialog.requiredProperties';

    /// Number of retries for the current Ask.
    public static readonly retries = 'dialog.retries';

    /// Last intent.
    public static readonly lastIntent = 'dialog.lastIntent';

    /// Last trigger event: defined in FormEvent, ask, clarifyEntity etc..
    public static readonly lastTriggerEvent = 'dialog.lastTriggerEvent';
}