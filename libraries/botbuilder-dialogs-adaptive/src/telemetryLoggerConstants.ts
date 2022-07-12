/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines names of common adaptive dialog events for use with a [BotTelemetryClient](xref:botbuilder-core.BotTelemetryClient) object.
 */
export class TelemetryLoggerConstants {
    /**
     * The generic name of the event when a binding completes. When this event is logged, the context property will contain a more descriptive constant.
     */
    static readonly GeneratorResultEvent: string = 'GeneratorResult';

    /**
     * The name of the event when an adaptive dialog trigger occurs.
     */
    static readonly TriggerEvent: string = 'AdaptiveDialogTrigger';

    /**
     * The name of the event when an adaptive dialog complete occurs.
     */
    static readonly CompleteEvent: string = 'AdaptiveDialogComplete';

    /**
     * The name of the event when an adaptive dialog cancel occurs.
     */
    static readonly DialogCancelEvent: string = 'AdaptiveDialogCancel';

    /**
     * The name of the event when an adaptive dialog start occurs.
     */
    static readonly DialogStartEvent: string = 'AdaptiveDialogStart';

    /**
     * The name of the event when an adaptive dialog action occurs.
     */
    static readonly DialogActionEvent: string = 'AdaptiveDialogAction';

    /**
     * The name of the event when a Log Action result occurs.
     */
    static readonly LogActionResultEvent: string = 'LogActionResult';

    /**
     * The name of the event when a Sent Activity result occurs.
     */
    static readonly SendActivityResultEvent: string = 'SendActivityResult';

    /**
     * The name of the event when an Update Activity result occurs.
     */
    static readonly UpdateActivityResultEvent: string = 'UpdateActivityResult';

    /**
     * The name of the event when an Input result occurs.
     */
    static readonly InputDialogResultEvent: string = 'InputDialogResult';

    /**
     * The name of the event when an OAuth Input result occurs.
     */
    static readonly OAuthInputResultEvent: string = 'OAuthInputResult';

    /**
     * The name of the event when a cross trained recognizer set result occurs.
     */
    static readonly CrossTrainedRecognizerSetResultEvent: string = 'CrossTrainedRecognizerSetResult';

    /**
     * The name of the event when a multi language recognizer result occurs.
     */
    static readonly MultiLanguageRecognizerResultEvent: string = 'MultiLanguageRecognizerResult';

    /**
     * The name of the event when a recognizer set result occurs.
     */
    static readonly RecognizerSetResultEvent: string = 'RecognizerSetResult';

    /**
     * The name of the event when a regex recognizer result occurs.
     */
    static readonly RegexRecognizerResultEvent: string = 'RegexRecognizerResult';

    /**
     * The name of the event when a value recognizer result occurs.
     */
    static readonly ValueRecognizerResultEvent: string = 'ValueRecognizerResult';
}
