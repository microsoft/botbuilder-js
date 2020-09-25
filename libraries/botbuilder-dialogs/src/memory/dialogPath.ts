/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines path for available dialogs.
 */
export class DialogPath {
    /// Counter of emitted events.
    public static readonly eventCounter = 'dialog.eventCounter';

    /// Currently expected properties.
    public static readonly expectedProperties = 'dialog.expectedProperties';

    /// Default operation to use for entities where there is no identified operation entity.
    public static readonly defaultOperation = 'dialog.defaultOperation';

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
