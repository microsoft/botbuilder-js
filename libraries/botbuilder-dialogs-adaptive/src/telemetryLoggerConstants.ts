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
    public static readonly GeneratorResultEvent: string = 'GeneratorResult';

    /**
     * The name of the event when an adaptive dialog trigger occurs.
     */
    public static readonly TriggerEvent: string = 'AdaptiveDialogTrigger';

    /**
     * The name of the event when an adaptive dialog complete occurs.
     */
    public static readonly CompleteEvent: string = 'AdaptiveDialogComplete';

    /**
     * The name of the event when an adaptive dialog cancel occurs.
     */
    public static readonly DialogCancelEvent: string = 'AdaptiveDialogCancel';

    /**
     * The name of the event when an adaptive dialog start occurs.
     */
    public static readonly DialogStartEvent: string = 'AdaptiveDialogStart';

    /**
     * The name of the event when an adaptive dialog action occurs.
     */
    public static readonly DialogActionEvent: string = 'AdaptiveDialogAction';

    /**
     * The name of the event when a Log Action result occurs.
     */
    public static readonly LogActionResultEvent: string = 'LogActionResult';

    /**
     * The name of the event when a Sent Activity result occurs.
     */
    public static readonly SendActivityResultEvent: string = 'SendActivityResult';

    /**
     * The name of the event when an Update Activity result occurs.
     */
    public static readonly UpdateActivityResultEvent: string = 'UpdateActivityResult';

    /**
     * The name of the event when an Input result occurs.
     */
    public static readonly InputDialogResultEvent: string = 'InputDialogResult';

    /**
     * The name of the event when an OAuth Input result occurs.
     */
    public static readonly OAuthInputResultEvent: string = 'OAuthInputResult';

    /**
     * The name of the event when a cross trained recognizer set result occurs.
     */
    public static readonly CrossTrainedRecognizerSetResultEvent: string = 'CrossTrainedRecognizerSetResult';

    /**
     * The name of the event when a multi language recognizer result occurs.
     */
    public static readonly MultiLanguageRecognizerResultEvent: string = 'MultiLanguageRecognizerResult';

    /**
     * The name of the event when a recognizer set result occurs.
     */
    public static readonly RecognizerSetResultEvent: string = 'RecognizerSetResult';

    /**
     * The name of the event when a regex recognizer result occurs.
     */
    public static readonly RegexRecognizerResultEvent: string = 'RegexRecognizerResult';

    /**
     * The name of the event when a value recognizer result occurs.
     */
    public static readonly ValueRecognizerResultEvent: string = 'ValueRecognizerResult';
}
