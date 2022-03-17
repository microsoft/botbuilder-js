// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Defines names of common properties for use with a [BotTelemetryClient](xref:botbuilder-core.BotTelemetryClient) object.
 */
export class TelemetryConstants {
    /**
     * The telemetry property value for channel id.
     */
    public static readonly channelIdProperty: string = 'channelId';

    /**
     * The telemetry property value for conversation id.
     */
    public static readonly conversationIdProperty: string = 'conversationId';

    /**
     * The telemetry property value for conversation name.
     */
    public static readonly conversationNameProperty: string = 'conversationName';

    /**
     * The telemetry property value for dialog id.
     */
    public static readonly dialogIdProperty: string = 'dialogId';

    /**
     * The telemetry property value for from id.
     */
    public static readonly fromIdProperty: string = 'fromId';

    /**
     * The telemetry property value for from name.
     */
    public static readonly fromNameProperty: string = 'fromName';

    /**
     * The telemetry property value for locale.
     */
    public static readonly localeProperty: string = 'locale';

    /**
     * The telemetry property value for recipient id.
     */
    public static readonly recipientIdProperty: string = 'recipientId';

    /**
     * The telemetry property value for recipient name.
     */
    public static readonly recipientNameProperty: string = 'recipientName';

    /**
     * The telemetry property value for reply activity id.
     */
    public static readonly replyActivityIdProperty: string = 'replyActivityId';

    /**
     * The telemetry property value for text.
     */
    public static readonly textProperty: string = 'text';

    /**
     * The telemetry property value for speak.
     */
    public static readonly speakProperty: string = 'speak';

    /**
     * The telemetry property value for user id.
     */
    public static readonly userIdProperty: string = 'userId';

    /**
     * The telemetry property value for attachments.
     */
    public static readonly attachmentsProperty: string = 'attachments';

    /**
     * The telemetry property value for activity type.
     */
    public static readonly activityTypeProperty: string = 'type';
}
