/**
 * @module botbuilder-ai
 */

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

/**
 * The BotTelemetryClient event and property names that logged by default.
 */
export class LuisTelemetryConstants {
    public static readonly luisResultEvent = 'LuisResult'; // Event name
    public static readonly applicationIdProperty = 'applicationId';
    public static readonly intentProperty = 'intent';
    public static readonly intentScoreProperty = 'intentScore';
    public static readonly intent2Property = 'intent2';
    public static readonly intentScore2Property = 'intentScore2';
    public static readonly entitiesProperty = 'entities';
    public static readonly questionProperty = 'question';
    public static readonly activityIdProperty = 'activityId';
    public static readonly sentimentLabelProperty = 'sentimentLabel';
    public static readonly sentimentScoreProperty = 'sentimentScore';
    public static readonly fromIdProperty = 'fromId';
}
